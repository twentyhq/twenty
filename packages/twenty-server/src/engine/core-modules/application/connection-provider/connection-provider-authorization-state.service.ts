import { Injectable, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { type ConnectionProviderFlowSecrets } from 'src/engine/core-modules/application/connection-provider/types/connection-provider-flow-secrets.type';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

const buildFlowSecretCacheKey = (flowSecretId: string): string =>
  `connection-provider-oauth-flow-secret:${flowSecretId}`;
const FLOW_SECRET_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ConnectionProviderAuthorizationStateService {
  private readonly logger = new Logger(
    ConnectionProviderAuthorizationStateService.name,
  );

  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async sign({
    connectionProvider,
    workspaceId,
    userId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
    redirectLocation,
    flowSecrets,
    expiresIn,
  }: ConnectionAuthorizationArgs & {
    flowSecrets: ConnectionProviderFlowSecrets | null;
    expiresIn: string;
  }): Promise<string> {
    const flowSecretId = isDefined(flowSecrets) ? randomUUID() : null;

    if (isDefined(flowSecretId)) {
      await this.cacheStorage.set(
        buildFlowSecretCacheKey(flowSecretId),
        flowSecrets,
        FLOW_SECRET_TTL_MS,
      );
    }

    const payload: AppOAuthStateJwtPayload = {
      sub: connectionProvider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userId,
      userWorkspaceId,
      scope: connectionProvider.scope,
      reconnectingConnectedAccountId,
      redirectLocation,
      flowSecretId,
    };

    return this.jwtWrapperService.signAsyncOrThrow(payload, { expiresIn });
  }

  async verifyOrThrow(state: string): Promise<AppOAuthStateJwtPayload> {
    const verified: AppOAuthStateJwtPayload = await this.jwtWrapperService
      .verifyJwtToken(state)
      .catch((error: unknown) => {
        this.logger.warn(
          `Rejected OAuth state: ${error instanceof Error ? error.message : String(error)}`,
        );

        throw new ConnectionProviderException(
          'OAuth state signature invalid or expired',
          ConnectionProviderExceptionCode.INVALID_STATE,
        );
      });

    if (verified.type !== JwtTokenTypeEnum.APP_OAUTH_STATE) {
      throw new ConnectionProviderException(
        'Wrong JWT type for OAuth state',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    return verified;
  }

  async consumeFlowSecretsOrThrow(
    flowSecretId: string,
  ): Promise<ConnectionProviderFlowSecrets> {
    const cacheKey = buildFlowSecretCacheKey(flowSecretId);
    const flowSecrets =
      await this.cacheStorage.get<ConnectionProviderFlowSecrets>(cacheKey);
    const isClaimed =
      isDefined(flowSecrets) &&
      (await this.cacheStorage.setIfAbsent(
        `${cacheKey}:consumed`,
        true,
        FLOW_SECRET_TTL_MS,
      ));

    if (!isClaimed) {
      throw new ConnectionProviderException(
        'OAuth sign-in expired or was already completed',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    await this.cacheStorage.del(cacheKey);

    return flowSecrets;
  }

  async findErrorRedirectTarget(state: string): Promise<{
    workspaceId: string;
    redirectLocation: string | null;
  } | null> {
    try {
      const { workspaceId, redirectLocation } = await this.verifyOrThrow(state);

      return { workspaceId, redirectLocation };
    } catch (error) {
      this.logger.warn(
        `Could not read the OAuth state for the error redirect: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }
}
