import { Injectable } from '@nestjs/common';

import { type OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { isUniqueViolationError } from 'src/engine/workspace-query-executor/utils/is-unique-violation-error.util';
import { ConnectionProviderOAuthClientEntity } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/entities/connection-provider-oauth-client.entity';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type OAuthDiscoveryClientToSave = OAuthDiscoveryStoredClient & {
  connectionProviderId: string;
  workspaceId: string;
};

// RFC 7591: a client_secret_expires_at of 0 means the secret never expires
const NEVER_EXPIRES = 0;

@Injectable()
export class ConnectionProviderDiscoveredOAuthClientService {
  constructor(
    @InjectWorkspaceScopedRepository(ConnectionProviderOAuthClientEntity)
    private readonly oauthClientRepository: WorkspaceScopedRepository<ConnectionProviderOAuthClientEntity>,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async findStoredClient({
    connectionProviderId,
    workspaceId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
  }): Promise<OAuthDiscoveryStoredClient | null> {
    const oauthClient = await this.oauthClientRepository.findOneBy(
      workspaceId,
      { connectionProviderId },
    );

    if (!isDefined(oauthClient)) {
      return null;
    }

    const clientSecret =
      this.connectedAccountTokenEncryptionService.decryptNullable({
        ciphertext: oauthClient.clientSecret,
        workspaceId,
      });

    return {
      registrationMethod: oauthClient.registrationMethod,
      redirectUri: oauthClient.redirectUri,
      discoveryState: oauthClient.discoveryState,
      clientInformation: {
        client_id: oauthClient.clientId,
        redirect_uris: [oauthClient.redirectUri],
        ...(isDefined(clientSecret) && { client_secret: clientSecret }),
        ...(isDefined(oauthClient.clientSecretExpiresAt) && {
          client_secret_expires_at: Math.floor(
            oauthClient.clientSecretExpiresAt.getTime() / 1000,
          ),
        }),
        ...(isDefined(oauthClient.tokenEndpointAuthMethod) && {
          token_endpoint_auth_method: oauthClient.tokenEndpointAuthMethod,
        }),
      },
    };
  }

  async findStoredClientOrThrow(args: {
    connectionProviderId: string;
    workspaceId: string;
  }): Promise<OAuthDiscoveryStoredClient> {
    const storedClient = await this.findStoredClient(args);

    if (!isDefined(storedClient)) {
      throw new ConnectionProviderException(
        `Connection provider ${args.connectionProviderId} has no OAuth client yet: sign in again`,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    return storedClient;
  }

  async replaceClientIfUnchanged({
    client,
    expectedClientId,
  }: {
    client: OAuthDiscoveryClientToSave;
    expectedClientId: string;
  }): Promise<boolean> {
    const { affected } = await this.oauthClientRepository.update(
      client.workspaceId,
      {
        connectionProviderId: client.connectionProviderId,
        clientId: expectedClientId,
      },
      this.toRow(client),
    );

    return isDefined(affected) && affected > 0;
  }

  async insertClientIfAbsent(
    client: OAuthDiscoveryClientToSave,
  ): Promise<boolean> {
    try {
      await this.oauthClientRepository.insert(
        client.workspaceId,
        this.toRow(client),
      );

      return true;
    } catch (error) {
      if (isUniqueViolationError(error)) {
        return false;
      }

      throw error;
    }
  }

  async deleteClient({
    connectionProviderId,
    workspaceId,
    clientId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
    clientId: string;
  }): Promise<void> {
    await this.oauthClientRepository.delete(workspaceId, {
      connectionProviderId,
      clientId,
    });
  }

  private toRow({
    connectionProviderId,
    workspaceId,
    registrationMethod,
    redirectUri,
    clientInformation,
    discoveryState,
  }: OAuthDiscoveryClientToSave): QueryDeepPartialEntity<ConnectionProviderOAuthClientEntity> {
    return {
      connectionProviderId,
      registrationMethod,
      redirectUri,
      discoveryState:
        discoveryState as QueryDeepPartialEntity<OAuthDiscoveryState>,
      clientId: clientInformation.client_id,
      clientSecret: this.connectedAccountTokenEncryptionService.encryptNullable(
        {
          plaintext: isDefined(clientInformation.client_secret)
            ? plaintextStringSchema.parse(clientInformation.client_secret)
            : null,
          workspaceId,
        },
      ),
      clientSecretExpiresAt:
        isDefined(clientInformation.client_secret_expires_at) &&
        clientInformation.client_secret_expires_at !== NEVER_EXPIRES
          ? new Date(clientInformation.client_secret_expires_at * 1000)
          : null,
      tokenEndpointAuthMethod:
        'token_endpoint_auth_method' in clientInformation
          ? (clientInformation.token_endpoint_auth_method ?? null)
          : null,
    };
  }
}
