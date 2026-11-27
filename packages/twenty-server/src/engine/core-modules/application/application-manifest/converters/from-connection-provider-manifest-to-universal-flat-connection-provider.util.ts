import {
  type ConnectionProviderManifest,
  DEFAULT_CONNECTION_PROVIDER_SCOPE,
  normalizeConnectionProviderManifest,
  type StoredCustomConnectionProviderConfig,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatConnectionProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-connection-provider.type';

// A custom provider missing either logic function gets no config, which the connection provider validator refuses.
const toStoredCustomConfig = (
  connectionProviderManifest: ConnectionProviderManifest,
): StoredCustomConnectionProviderConfig | null => {
  if (connectionProviderManifest.type !== 'custom') {
    return null;
  }

  const {
    authorizeLogicFunctionUniversalIdentifier,
    callbackLogicFunctionUniversalIdentifier,
  } = connectionProviderManifest.custom;

  if (
    !isDefined(authorizeLogicFunctionUniversalIdentifier) ||
    !isDefined(callbackLogicFunctionUniversalIdentifier)
  ) {
    return null;
  }

  return {
    authorizeLogicFunctionUniversalIdentifier,
    callbackLogicFunctionUniversalIdentifier,
  };
};

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
    const normalizedManifest = normalizeConnectionProviderManifest(
      connectionProviderManifest,
    );
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
          }
        : null;

    return {
      universalIdentifier: connectionProviderManifest.universalIdentifier,
      applicationUniversalIdentifier,
      name: connectionProviderManifest.name,
      displayName: connectionProviderManifest.displayName,
      logo: connectionProviderManifest.logo ?? null,
      via: isDefined(connectionProviderManifest.via)
        ? {
            name: connectionProviderManifest.via.name,
            description: connectionProviderManifest.via.description ?? null,
            logo: connectionProviderManifest.via.logo ?? null,
            url: connectionProviderManifest.via.url ?? null,
          }
        : null,
      type: connectionProviderManifest.type,
      scope:
        connectionProviderManifest.scope ?? DEFAULT_CONNECTION_PROVIDER_SCOPE,
      oauthConfig,
      customConfig: toStoredCustomConfig(normalizedManifest),
      oauthDiscoveryConfig:
        connectionProviderManifest.type === 'oauth-discovery'
          ? {
              resourceUrl:
                connectionProviderManifest.oauthDiscovery.resourceUrl,
            }
          : null,
      identifyAccountLogicFunctionUniversalIdentifier:
        normalizedManifest.identifyAccountLogicFunctionUniversalIdentifier ??
        null,
      onConnectLogicFunctionUniversalIdentifier:
        normalizedManifest.onConnectLogicFunctionUniversalIdentifier ?? null,
      onDisconnectLogicFunctionUniversalIdentifier:
        normalizedManifest.onDisconnectLogicFunctionUniversalIdentifier ?? null,
      createdAt: now,
      updatedAt: now,
    };
  };
