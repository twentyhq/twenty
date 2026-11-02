import { Injectable, Logger } from '@nestjs/common';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class ConnectionProviderAuthorizationStateService {
  private readonly logger = new Logger(
    ConnectionProviderAuthorizationStateService.name,
  );

  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async sign({
    connectionProvider,
    workspaceId,
    userId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
    redirectLocation,
    codeVerifier,
    expiresIn,
  }: ConnectionAuthorizationArgs & {
    codeVerifier: string | null;
    expiresIn: string;
  }): Promise<string> {
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
      codeVerifier,
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
