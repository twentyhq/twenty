import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { type IdentifiedAccount } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import {
  assertOAuthProvider,
  type OAuthConnectionProvider,
} from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { computePkceChallenge } from 'src/engine/core-modules/application/connection-provider/utils/compute-pkce-challenge.util';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { extractEmailFromIdTokenClaims } from 'src/engine/core-modules/application/connection-provider/utils/extract-email-from-id-token-claims.util';
import { generatePkceVerifier } from 'src/engine/core-modules/application/connection-provider/utils/generate-pkce-verifier.util';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  ConnectedAccountEntity,
  type ConnectedAccountScope,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

const STATE_JWT_EXPIRES_IN = '10m';

type AuthorizeArgs = {
  connectionProvider: ConnectionProviderEntity;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  reconnectingConnectedAccountId: string | null;
  redirectLocation: string | null;
};

type CallbackArgs = {
  code: string;
  state: string;
};

type CallbackResult = {
  connectedAccountId: string;
  workspaceId: string;
  applicationId: string;
  redirectLocation: string | null;
};

@Injectable()
export class ConnectionProviderOAuthFlowService {
  private readonly logger = new Logger(ConnectionProviderOAuthFlowService.name);

  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async startAuthorizationFlow(
    args: AuthorizeArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userId, userWorkspaceId } = args;

    assertOAuthProvider(connectionProvider);

    await this.assertReconnectTargetUsableByCallerOrThrow({
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userWorkspaceId,
      reconnectingConnectedAccountId: args.reconnectingConnectedAccountId,
    });

    await this.validateCallerCanManageConnection({
      workspaceId,
      userWorkspaceId,
      scope: connectionProvider.scope,
    });

    const { clientId } =
      await this.oauthProviderService.getClientCredentials(connectionProvider);

    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      connectionProvider.oauthConfig;

    const codeVerifier = usePkce ? generatePkceVerifier() : null;

    const state = await this.signState({
      sub: connectionProvider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userId,
      userWorkspaceId,
      scope: connectionProvider.scope,
      reconnectingConnectedAccountId: args.reconnectingConnectedAccountId,
      redirectLocation: args.redirectLocation,
      codeVerifier,
    });

    const callbackUrl = buildAppOAuthCallbackUrl(this.getServerUrl());

    const authorizationUrl = new URL(authorizationEndpoint);

    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', callbackUrl);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', scopes.join(' '));
    authorizationUrl.searchParams.set('state', state);

    if (codeVerifier) {
      authorizationUrl.searchParams.set(
        'code_challenge',
        computePkceChallenge(codeVerifier),
      );
      authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    }

    for (const [key, value] of Object.entries(authorizationParams ?? {})) {
      authorizationUrl.searchParams.set(key, value);
    }

    return { authorizationUrl: authorizationUrl.toString() };
  }

  async completeAuthorizationFlow(args: CallbackArgs): Promise<CallbackResult> {
    const statePayload = await this.verifyState(args.state);

    const provider = await this.oauthProviderService.findOneByIdOrThrow({
      id: statePayload.connectionProviderId,
      workspaceId: statePayload.workspaceId,
    });

    assertOAuthProvider(provider);

    await this.assertReconnectTargetUsableByCallerOrThrow({
      connectionProviderId: provider.id,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    await this.validateCallerCanManageConnection({
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
    });

    const { clientId, clientSecret } =
      await this.oauthProviderService.getClientCredentials(provider);

    const callbackUrl = buildAppOAuthCallbackUrl(this.getServerUrl());

    let tokenResponse: TokenExchangeResponse;

    try {
      tokenResponse = await exchangeCodeForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.oauthConfig.tokenEndpoint,
        clientId,
        clientSecret,
        code: args.code,
        redirectUri: callbackUrl,
        codeVerifier: statePayload.codeVerifier,
        contentType: provider.oauthConfig.tokenRequestContentType,
      });
    } catch (error) {
      this.logger.error(
        `OAuth token exchange failed for provider ${provider.id}: ${(error as Error).message}`,
      );

      throw new ConnectionProviderException(
        (error as Error).message,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    const identifiedAccount =
      await this.connectionProviderLifecycleHookService.runIdentifyAccount({
        provider,
        workspaceId: statePayload.workspaceId,
        accessToken: tokenResponse.accessToken,
      });

    const connectedAccount = await this.persistConnectedAccount({
      provider,
      tokenResponse,
      identifiedAccount,
      workspaceId: statePayload.workspaceId,
      userId: statePayload.userId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    await this.connectionProviderLifecycleHookService.dispatchOnConnect({
      provider,
      workspaceId: statePayload.workspaceId,
      connectedAccountId: connectedAccount.id,
    });

    return {
      connectedAccountId: connectedAccount.id,
      workspaceId: statePayload.workspaceId,
      applicationId: provider.applicationId,
      redirectLocation: statePayload.redirectLocation,
    };
  }

  private async validateCallerCanManageConnection({
    workspaceId,
    userWorkspaceId,
    scope,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
  }): Promise<void> {
    await this.appConnectionAccessService.validateCallerCanManageConnection({
      isWorkspaceShared: scope === 'WORKSPACE',
      workspaceId,
      userWorkspaceId,
    });
  }

  private async assertReconnectTargetUsableByCallerOrThrow({
    connectionProviderId,
    workspaceId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
    userWorkspaceId: string;
    reconnectingConnectedAccountId: string | null;
  }): Promise<void> {
    if (!isDefined(reconnectingConnectedAccountId)) {
      return;
    }

    const reconnectTarget = await this.connectedAccountRepository.findOne({
      where: buildConnectedAccountUsableByCallerWhere({
        baseWhere: {
          id: reconnectingConnectedAccountId,
          workspaceId,
          connectionProviderId,
        },
        userWorkspaceId,
      }),
    });

    if (!isDefined(reconnectTarget)) {
      throw new ConnectionProviderException(
        `Cannot reconnect connectedAccount ${reconnectingConnectedAccountId}: not found in this workspace for the requested provider, or not usable by this member.`,
        ConnectionProviderExceptionCode.FORBIDDEN,
      );
    }
  }

  private async signState(payload: AppOAuthStateJwtPayload): Promise<string> {
    return this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: STATE_JWT_EXPIRES_IN,
    });
  }

  async findErrorRedirectTargetFromState(state: string): Promise<{
    workspaceId: string;
    redirectLocation: string | null;
  } | null> {
    try {
      const { workspaceId, redirectLocation } = await this.verifyState(state);

      return { workspaceId, redirectLocation };
    } catch (error) {
      this.logger.warn(
        `Could not read the OAuth state for the error redirect: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }

  private async verifyState(state: string): Promise<AppOAuthStateJwtPayload> {
    try {
      const verified = (await this.jwtWrapperService.verifyJwtToken(
        state,
      )) as AppOAuthStateJwtPayload;

      if (verified.type !== JwtTokenTypeEnum.APP_OAUTH_STATE) {
        throw new Error('Wrong JWT type for OAuth state');
      }

      return verified;
    } catch (error) {
      this.logger.warn(
        `Rejected OAuth state: ${(error as Error).message ?? 'unknown reason'}`,
      );

      throw new ConnectionProviderException(
        'OAuth state signature invalid or expired',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }
  }

  private getServerUrl(): string {
    return this.twentyConfigService.get('SERVER_URL');
  }

  private async resolveConnectedAccountHandle({
    tokenResponse,
    userId,
  }: {
    tokenResponse: TokenExchangeResponse;
    userId: string;
  }): Promise<string> {
    const idTokenEmail = isDefined(tokenResponse.idToken)
      ? extractEmailFromIdTokenClaims(tokenResponse.idToken)
      : null;

    if (isDefined(idTokenEmail)) {
      return idTokenEmail;
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!isDefined(user)) {
      throw new ConnectionProviderException(
        'User not found',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    return user.email;
  }

  private async persistConnectedAccount({
    provider,
    tokenResponse,
    identifiedAccount,
    workspaceId,
    userId,
    userWorkspaceId,
    scope,
    reconnectingConnectedAccountId,
  }: {
    provider: OAuthConnectionProvider;
    tokenResponse: TokenExchangeResponse;
    identifiedAccount: IdentifiedAccount | null;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
    reconnectingConnectedAccountId: string | null;
  }): Promise<ConnectedAccountEntity> {
    const { encryptedAccessToken, encryptedRefreshToken } =
      this.connectedAccountTokenEncryptionService.encryptTokenPair({
        accessToken: tokenResponse.accessToken,
        refreshToken: isDefined(tokenResponse.refreshToken)
          ? tokenResponse.refreshToken
          : null,
        workspaceId,
      });

    const handle =
      identifiedAccount?.handle ??
      (await this.resolveConnectedAccountHandle({
        tokenResponse,
        userId,
      }));

    const sharedFields = {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
      lastCredentialsRefreshedAt: new Date(),
      authFailedAt: null,
      authFailedReason: null,
      archivedAt: null,
      scope,
      handle,
      externalAccountId: identifiedAccount?.externalAccountId ?? null,
    };

    if (isDefined(reconnectingConnectedAccountId)) {
      const reconnectTarget = {
        id: reconnectingConnectedAccountId,
        workspaceId,
      };

      // Compared and written in one statement so overlapping reconnects cannot pin different accounts.
      const updateResult = await this.connectedAccountRepository.update(
        isDefined(identifiedAccount)
          ? [
              { ...reconnectTarget, externalAccountId: IsNull() },
              {
                ...reconnectTarget,
                externalAccountId: identifiedAccount.externalAccountId,
              },
            ]
          : reconnectTarget,
        { ...sharedFields, userWorkspaceId },
      );

      const connectedAccount =
        await this.connectedAccountRepository.findOneByOrFail(reconnectTarget);

      if (updateResult.affected === 0 && isDefined(identifiedAccount)) {
        const authorizedAccountHandle =
          identifiedAccount.handle ?? identifiedAccount.externalAccountId;

        throw new ConnectionProviderException(
          `You authorized ${authorizedAccountHandle}, but this connection belongs to ${connectedAccount.handle}. Reconnect with ${connectedAccount.handle}, or add a new connection for ${authorizedAccountHandle}.`,
          ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
        );
      }

      return connectedAccount;
    }

    const existingCount = await this.connectedAccountRepository.count({
      where: { connectionProviderId: provider.id, workspaceId },
    });

    const name = `${provider.displayName} #${existingCount + 1}`;

    const created = this.connectedAccountRepository.create({
      ...sharedFields,
      name,
      scope,
      provider: ConnectedAccountProvider.APP,
      workspaceId,
      applicationId: provider.applicationId,
      connectionProviderId: provider.id,
      userWorkspaceId,
    });

    return this.connectedAccountRepository.save(created);
  }
}
