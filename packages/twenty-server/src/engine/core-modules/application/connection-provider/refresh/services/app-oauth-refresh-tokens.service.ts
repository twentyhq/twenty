import { Injectable, Logger } from '@nestjs/common';

import {
  OAuthError,
  ServerError,
  TemporarilyUnavailableError,
  TooManyRequestsError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderOAuthGrantService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-grant.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { OAuthTokenEndpointError } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountPlaintextTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

// A provider that is not set up for refresh is not the account's fault; anything else means sign in again
const PROVIDER_SETUP_EXCEPTION_CODES: ConnectionProviderExceptionCode[] = [
  ConnectionProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED,
  ConnectionProviderExceptionCode.INVALID_REQUEST,
];

@Injectable()
export class AppOAuthRefreshAccessTokenService {
  private readonly logger = new Logger(AppOAuthRefreshAccessTokenService.name);

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly oauthGrantService: ConnectionProviderOAuthGrantService,
  ) {}

  async refreshTokens(
    connectedAccount: ConnectedAccountEntity,
    refreshToken: PlaintextString,
  ): Promise<ConnectedAccountPlaintextTokens> {
    if (!isDefined(connectedAccount.connectionProviderId)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccount.id} has no connectionProviderId`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    const provider = await this.findProvider({
      connectionProviderId: connectedAccount.connectionProviderId,
      workspaceId: connectedAccount.workspaceId,
    });

    try {
      const tokenResponse = await this.oauthGrantService
        .getOrThrow(provider)
        .refreshTokens({
          provider,
          workspaceId: connectedAccount.workspaceId,
          refreshToken,
        });

      return {
        accessToken: tokenResponse.accessToken,
        // Fall back to the original when the response omits one — some
        // providers don't rotate refresh tokens.
        refreshToken: isDefined(tokenResponse.refreshToken)
          ? tokenResponse.refreshToken
          : refreshToken,
        accessTokenExpiresAt: tokenResponse.accessTokenExpiresAt,
      };
    } catch (error) {
      if (error instanceof ConnectedAccountRefreshAccessTokenException) {
        throw error;
      }

      if (error instanceof ConnectionProviderException) {
        throw new ConnectedAccountRefreshAccessTokenException(
          error.message,
          PROVIDER_SETUP_EXCEPTION_CODES.includes(error.code)
            ? ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED
            : ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      this.logger.warn(
        `App OAuth refresh failed for connected account ${connectedAccount.id}: ${(error as Error).message}`,
      );

      throw new ConnectedAccountRefreshAccessTokenException(
        `App OAuth refresh failed: ${(error as Error).message}`,
        this.isTransientRefreshError(error)
          ? ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR
          : ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }
  }

  // Only 4xx token-endpoint responses (esp. invalid_grant) imply the user
  // must reconnect — 5xx and transport errors stay transient.
  private isTransientRefreshError(error: unknown): boolean {
    if (error instanceof OAuthTokenEndpointError) {
      return error.status >= 500;
    }

    if (error instanceof OAuthError) {
      return (
        error instanceof ServerError ||
        error instanceof TemporarilyUnavailableError ||
        error instanceof TooManyRequestsError
      );
    }

    return true;
  }

  private async findProvider({
    connectionProviderId,
    workspaceId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
  }): Promise<ConnectionProviderEntity> {
    try {
      return await this.connectionProviderService.findOneByIdOrThrow({
        id: connectionProviderId,
        workspaceId,
      });
    } catch (error) {
      throw this.toProviderNotSupportedError(error);
    }
  }

  private toProviderNotSupportedError(error: unknown): unknown {
    return error instanceof ConnectionProviderException
      ? new ConnectedAccountRefreshAccessTokenException(
          error.message,
          ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        )
      : error;
  }
}
