import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
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
import { generatePkceVerifier } from 'src/engine/core-modules/application/connection-provider/utils/generate-pkce-verifier.util';
import {
  type AppOAuthStateJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const STATE_JWT_EXPIRES_IN = '10m';

type AuthorizeArgs = {
  connectionProvider: ConnectionProviderEntity;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  visibility: 'user' | 'workspace';
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
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async startAuthorizationFlow(
    args: AuthorizeArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userId, userWorkspaceId } = args;

    assertOAuthProvider(connectionProvider);

    // Reconnect target must live in the requesting workspace and belong to
    // the same provider — without this guard a foreign id would silently
    // leak through findOneByOrFail later in the flow.
    if (isDefined(args.reconnectingConnectedAccountId)) {
      const target = await this.connectedAccountRepository.findOne({
        where: {
          id: args.reconnectingConnectedAccountId,
          workspaceId,
          connectionProviderId: connectionProvider.id,
        },
      });

      if (!isDefined(target)) {
        throw new ConnectionProviderException(
          `Cannot reconnect connectedAccount ${args.reconnectingConnectedAccountId}: not found in this workspace for the requested provider.`,
          ConnectionProviderExceptionCode.FORBIDDEN,
        );
      }
    }

    const { clientId } =
      await this.oauthProviderService.getClientCredentials(connectionProvider);

    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      connectionProvider.oauthConfig;

    const codeVerifier = usePkce ? generatePkceVerifier() : null;

    const state = this.signState({
      sub: connectionProvider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userId,
      userWorkspaceId,
      visibility: args.visibility,
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
    const statePayload = this.verifyState(args.state);

    const provider = await this.oauthProviderService.findOneByIdOrThrow(
      statePayload.connectionProviderId,
    );

    assertOAuthProvider(provider);

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

    const connectedAccount = await this.persistConnectedAccount({
      provider,
      tokenResponse,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      visibility: statePayload.visibility,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    return {
      connectedAccountId: connectedAccount.id,
      workspaceId: statePayload.workspaceId,
      applicationId: provider.applicationId,
      redirectLocation: statePayload.redirectLocation,
    };
  }

  private signState(payload: AppOAuthStateJwtPayload): string {
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.APP_OAUTH_STATE,
      payload.workspaceId,
    );

    return this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: STATE_JWT_EXPIRES_IN,
    });
  }

  private verifyState(state: string): AppOAuthStateJwtPayload {
    try {
      const verified = this.jwtWrapperService.verifyJwtToken(
        state,
      ) as AppOAuthStateJwtPayload;

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

  private async persistConnectedAccount({
    provider,
    tokenResponse,
    workspaceId,
    userWorkspaceId,
    visibility,
    reconnectingConnectedAccountId,
  }: {
    provider: OAuthConnectionProvider;
    tokenResponse: TokenExchangeResponse;
    workspaceId: string;
    userWorkspaceId: string;
    visibility: 'user' | 'workspace';
    reconnectingConnectedAccountId: string | null;
  }): Promise<ConnectedAccountEntity> {
    const sharedFields = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
      lastCredentialsRefreshedAt: new Date(),
      authFailedAt: null,
      visibility,
    };

    if (isDefined(reconnectingConnectedAccountId)) {
      // Workspace-scope both the update and the read so a foreign id can't
      // leak through findOneByOrFail.
      await this.connectedAccountRepository.update(
        { id: reconnectingConnectedAccountId, workspaceId },
        sharedFields,
      );

      return this.connectedAccountRepository.findOneByOrFail({
        id: reconnectingConnectedAccountId,
        workspaceId,
      });
    }

    const existingCount = await this.connectedAccountRepository.count({
      where: { connectionProviderId: provider.id, workspaceId },
    });

    const name = `${provider.displayName} #${existingCount + 1}`;

    const created = this.connectedAccountRepository.create({
      ...sharedFields,
      handle: name,
      name,
      visibility,
      provider: ConnectedAccountProvider.APP,
      workspaceId,
      applicationId: provider.applicationId,
      connectionProviderId: provider.id,
      userWorkspaceId,
    });

    return this.connectedAccountRepository.save(created);
  }
}
