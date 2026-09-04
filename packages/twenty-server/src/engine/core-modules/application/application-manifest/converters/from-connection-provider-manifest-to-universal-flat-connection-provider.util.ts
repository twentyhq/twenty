import {
  type ConnectionProviderManifest,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatConnectionProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-connection-provider.type';

export const fromConnectionProviderManifestToUniversalFlatConnectionProvider =
  ({
    connectionProviderManifest,
    applicationUniversalIdentifier,
    now,
  }: {
    connectionProviderManifest: ConnectionProviderManifest;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatConnectionProvider => {
    const oauthConfig: StoredOAuthConnectionProviderConfig | null =
      connectionProviderManifest.type === 'oauth'
        ? {
            authorizationEndpoint:
              connectionProviderManifest.oauth.authorizationEndpoint,
            tokenEndpoint: connectionProviderManifest.oauth.tokenEndpoint,
            revokeEndpoint:
              connectionProviderManifest.oauth.revokeEndpoint ?? null,
            scopes: connectionProviderManifest.oauth.scopes,
            clientIdVariable: connectionProviderManifest.oauth.clientIdVariable,
            clientSecretVariable:
              connectionProviderManifest.oauth.clientSecretVariable,
            authorizationParams:
              connectionProviderManifest.oauth.authorizationParams ?? null,
            tokenRequestContentType:
              connectionProviderManifest.oauth.tokenRequestContentType ??
              'json',
            usePkce: connectionProviderManifest.oauth.usePkce ?? true,
            identity: isDefined(connectionProviderManifest.oauth.identity)
              ? {
                  endpoint: connectionProviderManifest.oauth.identity.endpoint,
                  method:
                    connectionProviderManifest.oauth.identity.method ?? 'GET',
                  body: connectionProviderManifest.oauth.identity.body ?? null,
                  accountIdPath:
                    connectionProviderManifest.oauth.identity.accountIdPath,
                  labelPath:
                    connectionProviderManifest.oauth.identity.labelPath ?? null,
                }
              : null,
          }
        : null;

    return {
      universalIdentifier: connectionProviderManifest.universalIdentifier,
      applicationUniversalIdentifier,
      name: connectionProviderManifest.name,
      displayName: connectionProviderManifest.displayName,
      logo: connectionProviderManifest.logo ?? null,
      type: connectionProviderManifest.type,
      oauthConfig,
      onConnectLogicFunctionUniversalIdentifier:
        connectionProviderManifest.onConnectLogicFunction
          ?.universalIdentifier ?? null,
      onDisconnectLogicFunctionUniversalIdentifier:
        connectionProviderManifest.onDisconnectLogicFunction
          ?.universalIdentifier ?? null,
      createdAt: now,
      updatedAt: now,
    };
  };
