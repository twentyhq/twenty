import {
  type ConnectionProviderManifest,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';

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
          }
        : null;

    return {
      universalIdentifier: connectionProviderManifest.universalIdentifier,
      applicationUniversalIdentifier,
      name: connectionProviderManifest.name,
      displayName: connectionProviderManifest.displayName,
      type: connectionProviderManifest.type,
      oauthConfig,
      createdAt: now,
      updatedAt: now,
    };
  };
