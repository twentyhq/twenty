import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import ms from 'ms';
import { Repository } from 'typeorm';

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
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

const STATE_JWT_EXPIRES_IN = '10m';
const STATE_TTL_MS = ms(STATE_JWT_EXPIRES_IN);
const STATE_CACHE_KEY_PREFIX = 'app-oauth-state';

// The PKCE verifier stays server-side: in the state JWT it would travel
// through the provider alongside the code it is meant to protect.
type AppOAuthStateCacheEntry = {
  codeVerifier: string | null;
};

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
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async startAuthorizationFlow(
    args: AuthorizeArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userId, userWorkspaceId } = args;

    assertOAuthProvider(connectionProvider);

    let reconnectTarget: ConnectedAccountEntity | null = null;

    if (isDefined(args.reconnectingConnectedAccountId)) {
      reconnectTarget = await this.connectedAccountRepository.findOne({
        where: buildConnectedAccountUsableByCallerWhere({
          baseWhere: {
            id: args.reconnectingConnectedAccountId,
            workspaceId,
            connectionProviderId: connectionProvider.id,
          },
          userWorkspaceId,
        }),
      });

      if (!isDefined(reconnectTarget)) {
        throw new ConnectionProviderException(
          `Cannot reconnect connectedAccount ${args.reconnectingConnectedAccountId}: not found in this workspace for the requested provider, or not usable by this member.`,
          ConnectionProviderExceptionCode.FORBIDDEN,
        );
      }
    }

    await this.appConnectionAccessService.validateCallerCanManageConnection({
      isWorkspaceShared:
        args.visibility === 'workspace' ||
        reconnectTarget?.visibility === 'workspace',
      workspaceId,
      userWorkspaceId,
    });

    const { clientId } =
      await this.oauthProviderService.getClientCredentials(connectionProvider);

    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      connectionProvider.oauthConfig;

    const codeVerifier = usePkce ? generatePkceVerifier() : null;
    const stateId = crypto.randomUUID();

    await this.cacheStorage.set<AppOAuthStateCacheEntry>(
      `${STATE_CACHE_KEY_PREFIX}:${stateId}`,
      { codeVerifier },
      STATE_TTL_MS,
    );

    const state = await this.signState({
      sub: connectionProvider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      jti: stateId,
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userId,
      userWorkspaceId,
      visibility: args.visibility,
      reconnectingConnectedAccountId: args.reconnectingConnectedAccountId,
      redirectLocation: args.redirectLocation,
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

    const stateEntry =
      await this.cacheStorage.getAndDelete<AppOAuthStateCacheEntry>(
        `${STATE_CACHE_KEY_PREFIX}:${statePayload.jti}`,
      );

    if (!isDefined(stateEntry)) {
      throw new ConnectionProviderException(
        'OAuth state has already been used or has expired',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    const provider = await this.oauthProviderService.findOneByIdOrThrow({
      id: statePayload.connectionProviderId,
      workspaceId: statePayload.workspaceId,
    });

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
        codeVerifier: stateEntry.codeVerifier,
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
      userId: statePayload.userId,
      userWorkspaceId: statePayload.userWorkspaceId,
      visibility: statePayload.visibility,
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

  private async signState(payload: AppOAuthStateJwtPayload): Promise<string> {
    return this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: STATE_JWT_EXPIRES_IN,
    });
  }

  private async verifyState(state: string): Promise<AppOAuthStateJwtPayload> {
    try {
      const verified = (await this.jwtWrapperService.verifyJwtToken(
        state,
      )) as AppOAuthStateJwtPayload;

      if (verified.type !== JwtTokenTypeEnum.APP_OAUTH_STATE) {
        throw new Error('Wrong JWT type for OAuth state');
      }

      if (!isNonEmptyString(verified.jti)) {
        throw new Error('OAuth state is missing its identifier');
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
    workspaceId,
    userId,
    userWorkspaceId,
    visibility,
    reconnectingConnectedAccountId,
  }: {
    provider: OAuthConnectionProvider;
    tokenResponse: TokenExchangeResponse;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    visibility: 'user' | 'workspace';
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

    const handle = await this.resolveConnectedAccountHandle({
      tokenResponse,
      userId,
    });

    const sharedFields = {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
      lastCredentialsRefreshedAt: new Date(),
      authFailedAt: null,
      authFailedReason: null,
      visibility,
      handle,
    };

    if (isDefined(reconnectingConnectedAccountId)) {
      await this.connectedAccountRepository.update(
        { id: reconnectingConnectedAccountId, workspaceId },
        { ...sharedFields, userWorkspaceId },
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
