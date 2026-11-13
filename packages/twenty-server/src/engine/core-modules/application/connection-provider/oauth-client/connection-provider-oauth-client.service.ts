import { Injectable } from '@nestjs/common';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { DiscoveredOAuthClientDriver } from 'src/engine/core-modules/application/connection-provider/oauth-client/drivers/discovered-oauth-client.driver';
import { ManifestOAuthClientDriver } from 'src/engine/core-modules/application/connection-provider/oauth-client/drivers/manifest-oauth-client.driver';
import {
  type OAuthClientDriver,
  type OAuthClientDriverArgs,
} from 'src/engine/core-modules/application/connection-provider/oauth-client/types/oauth-client-driver.type';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { OAuthTokenEndpointError } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

@Injectable()
export class ConnectionProviderOAuthClientService {
  constructor(
    private readonly manifestOAuthClientDriver: ManifestOAuthClientDriver,
    private readonly discoveredOAuthClientDriver: DiscoveredOAuthClientDriver,
  ) {}

  async resolveForAuthorization(
    args: OAuthClientDriverArgs,
  ): Promise<ResolvedOAuthClient> {
    return this.getDriverOrThrow(args.provider).resolveForAuthorization(args);
  }

  async resolveForTokenRequest(
    args: OAuthClientDriverArgs,
  ): Promise<ResolvedOAuthClient> {
    return this.getDriverOrThrow(args.provider).resolveForTokenRequest(args);
  }

  async forgetClientIfRejected({
    provider,
    workspaceId,
    client,
    error,
  }: OAuthClientDriverArgs & {
    client: Pick<ResolvedOAuthClient, 'clientId'>;
    error: unknown;
  }): Promise<void> {
    if (
      !(error instanceof OAuthTokenEndpointError) ||
      error.errorCode !== 'invalid_client'
    ) {
      return;
    }

    await this.getDriverOrThrow(provider).forgetRejectedClient({
      provider,
      workspaceId,
      clientId: client.clientId,
    });
  }

  private getDriverOrThrow(
    provider: Pick<ConnectionProviderEntity, 'id' | 'type'>,
  ): OAuthClientDriver {
    switch (provider.type) {
      case 'oauth':
        return this.manifestOAuthClientDriver;
      case 'oauth-discovery':
        return this.discoveredOAuthClientDriver;
      default:
        throw new ConnectionProviderException(
          `Connection provider ${provider.id} of type ${provider.type} has no OAuth client`,
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
    }
  }
}
