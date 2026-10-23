import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  type ConnectionCallbackPayload,
  type IdentifiedAccount,
} from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { assertCustomProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-custom-provider.util';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import {
  buildAppCustomConnectionCallbackUrl,
  buildAppOAuthCallbackUrl,
} from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { computePkceChallenge } from 'src/engine/core-modules/application/connection-provider/utils/compute-pkce-challenge.util';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { extractEmailFromIdTokenClaims } from 'src/engine/core-modules/application/connection-provider/utils/extract-email-from-id-token-claims.util';
import { generatePkceVerifier } from 'src/engine/core-modules/application/connection-provider/utils/generate-pkce-verifier.util';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
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
// hosted logins can involve 2FA or checkpoints, and the account then arrives by notification
const CUSTOM_STATE_JWT_EXPIRES_IN = '1h';

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

type CustomCallbackArgs = {
  state: string;
  request: Pick<
    ConnectionCallbackPayload,
    'httpMethod' | 'queryStringParameters' | 'body'
  >;
};

type CustomCallbackResult = Omit<CallbackResult, 'connectedAccountId'> & {
  connectedAccountId: string | null;
};

type ConnectedAccountCredentials = {
  accessToken: PlaintextString | null;
  refreshToken: PlaintextString | null;
  scopes: string[] | null;
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
    private readonly cacheLockService: CacheLockService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async startAuthorizationFlow(
    args: AuthorizeArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userWorkspaceId } = args;

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

    if (connectionProvider.type === 'custom') {
      assertCustomProvider(connectionProvider);

      const state = await this.signAuthorizationState({
        ...args,
        codeVerifier: null,
        expiresIn: CUSTOM_STATE_JWT_EXPIRES_IN,
      });

      const authorizationUrl =
        await this.connectionProviderLifecycleHookService.runAuthorize({
          provider: connectionProvider,
          workspaceId,
          callbackUrl: buildAppCustomConnectionCallbackUrl({
            serverUrl: this.getServerUrl(),
            state,
          }),
        });

      return { authorizationUrl };
    }

    assertOAuthProvider(connectionProvider);

    const { clientId } =
      await this.oauthProviderService.getClientCredentials(connectionProvider);

    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      connectionProvider.oauthConfig;

    const codeVerifier = usePkce ? generatePkceVerifier() : null;

    const state = await this.signAuthorizationState({ ...args, codeVerifier });

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

    const handle =
      identifiedAccount?.handle ??
      (await this.resolveConnectedAccountHandle({
        idToken: tokenResponse.idToken,
        userId: statePayload.userId,
      }));

    const connectedAccount = await this.persistConnectedAccount({
      provider,
      credentials: {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
      },
      handle,
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

  async completeCustomAuthorizationFlow(
    args: CustomCallbackArgs,
  ): Promise<CustomCallbackResult> {
    const statePayload = await this.verifyState(args.state);

    const provider = await this.oauthProviderService.findOneByIdOrThrow({
      id: statePayload.connectionProviderId,
      workspaceId: statePayload.workspaceId,
    });

    assertCustomProvider(provider);

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

    const callbackResult = {
      workspaceId: statePayload.workspaceId,
      applicationId: provider.applicationId,
      redirectLocation: statePayload.redirectLocation,
    };

    const connectedAccountFromCallback =
      await this.connectionProviderLifecycleHookService.runCallback({
        provider,
        workspaceId: statePayload.workspaceId,
        request: args.request,
      });

    if (!isDefined(connectedAccountFromCallback)) {
      return { ...callbackResult, connectedAccountId: null };
    }

    const { externalAccountId, handle, accessToken } =
      connectedAccountFromCallback;

    // the redirect and the notification for one authorization often arrive together
    const { connectedAccount, isRepeatReport } =
      await this.cacheLockService.withLock(async () => {
        const activeConnectedAccountId = isDefined(
          statePayload.reconnectingConnectedAccountId,
        )
          ? null
          : await this.findCallerActiveConnectedAccountIdForUpstreamAccount({
              provider,
              workspaceId: statePayload.workspaceId,
              userWorkspaceId: statePayload.userWorkspaceId,
              externalAccountId,
            });

        return {
          isRepeatReport: isDefined(activeConnectedAccountId),
          connectedAccount: await this.persistConnectedAccount({
            provider,
            // a repeat report without a token or handle keeps the stored ones
            credentials: isDefined(accessToken)
              ? { accessToken, refreshToken: null, scopes: null }
              : undefined,
            handle,
            identifiedAccount: { externalAccountId },
            workspaceId: statePayload.workspaceId,
            userId: statePayload.userId,
            userWorkspaceId: statePayload.userWorkspaceId,
            scope: statePayload.scope,
            reconnectingConnectedAccountId:
              statePayload.reconnectingConnectedAccountId ??
              activeConnectedAccountId ??
              (await this.findCallerConnectedAccountIdForUpstreamAccount({
                provider,
                workspaceId: statePayload.workspaceId,
                userWorkspaceId: statePayload.userWorkspaceId,
                externalAccountId,
              })),
          }),
        };
      }, `app-custom-connection:${statePayload.workspaceId}:${provider.id}:${statePayload.userWorkspaceId}:${externalAccountId}`);

    // onConnect sets up remote state once per connection, not once per report
    if (!isRepeatReport) {
      await this.connectionProviderLifecycleHookService.dispatchOnConnect({
        provider,
        workspaceId: statePayload.workspaceId,
        connectedAccountId: connectedAccount.id,
      });
    }

    return { ...callbackResult, connectedAccountId: connectedAccount.id };
  }

  // services report one account several times (browser return, notification, retries), and each must update one connection
  private async findCallerConnectedAccountIdForUpstreamAccount({
    provider,
    workspaceId,
    userWorkspaceId,
    externalAccountId,
  }: {
    provider: Pick<ConnectionProviderEntity, 'id'>;
    workspaceId: string;
    userWorkspaceId: string;
    externalAccountId: string;
  }): Promise<string | null> {
    const existingConnectedAccount =
      await this.connectedAccountRepository.findOne({
        where: {
          workspaceId,
          connectionProviderId: provider.id,
          userWorkspaceId,
          externalAccountId,
        },
        select: { id: true },
      });

    return existingConnectedAccount?.id ?? null;
  }
  private async findCallerActiveConnectedAccountIdForUpstreamAccount({
    provider,
    workspaceId,
    userWorkspaceId,
    externalAccountId,
  }: {
    provider: Pick<ConnectionProviderEntity, 'id'>;
    workspaceId: string;
    userWorkspaceId: string;
    externalAccountId: string;
  }): Promise<string | null> {
    const activeConnectedAccount =
      await this.connectedAccountRepository.findOne({
        where: {
          workspaceId,
          connectionProviderId: provider.id,
          userWorkspaceId,
          externalAccountId,
          archivedAt: IsNull(),
          authFailedAt: IsNull(),
        },
        select: { id: true },
      });

    return activeConnectedAccount?.id ?? null;
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

  private async signAuthorizationState({
    connectionProvider,
    workspaceId,
    userId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
    redirectLocation,
    codeVerifier,
    expiresIn,
  }: AuthorizeArgs & {
    codeVerifier: string | null;
    expiresIn?: string;
  }): Promise<string> {
    return this.signState(
      {
        sub: connectionProvider.id,
        type: JwtTokenTypeEnum.APP_OAUTH_STATE,
        connectionProviderId: connectionProvider.id,
        workspaceId,
        userId,
        userWorkspaceId,
        scope: connectionProvider.scope,
        reconnectingConnectedAccountId,
        redirectLocation,
        codeVerifier,
      },
      expiresIn,
    );
  }

  private async signState(
    payload: AppOAuthStateJwtPayload,
    expiresIn = STATE_JWT_EXPIRES_IN,
  ): Promise<string> {
    return this.jwtWrapperService.signAsyncOrThrow(payload, { expiresIn });
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
    idToken,
    userId,
  }: {
    idToken: TokenExchangeResponse['idToken'];
    userId: string;
  }): Promise<string> {
    const idTokenEmail = isDefined(idToken)
      ? extractEmailFromIdTokenClaims(idToken)
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
    credentials,
    handle,
    identifiedAccount,
    workspaceId,
    userId,
    userWorkspaceId,
    scope,
    reconnectingConnectedAccountId,
  }: {
    provider: ConnectionProviderEntity;
    credentials: ConnectedAccountCredentials | undefined;
    handle: string | undefined;
    identifiedAccount: IdentifiedAccount | null;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
    reconnectingConnectedAccountId: string | null;
  }): Promise<ConnectedAccountEntity> {
    const sharedFields = {
      ...(isDefined(credentials) && {
        accessToken:
          this.connectedAccountTokenEncryptionService.encryptNullable({
            plaintext: credentials.accessToken,
            workspaceId,
          }),
        refreshToken:
          this.connectedAccountTokenEncryptionService.encryptNullable({
            plaintext: credentials.refreshToken,
            workspaceId,
          }),
        scopes: credentials.scopes,
        lastCredentialsRefreshedAt: new Date(),
      }),
      ...(isDefined(handle) && { handle }),
      authFailedAt: null,
      authFailedReason: null,
      archivedAt: null,
      scope,
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
      handle:
        handle ??
        (await this.resolveConnectedAccountHandle({ idToken: null, userId })),
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
