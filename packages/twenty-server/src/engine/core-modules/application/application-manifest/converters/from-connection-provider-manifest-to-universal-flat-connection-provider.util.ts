import { type ConnectionProviderManifest } from 'twenty-shared/application';

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
    return {
      universalIdentifier: connectionProviderManifest.universalIdentifier,
      applicationUniversalIdentifier,
      name: connectionProviderManifest.name,
      displayName: connectionProviderManifest.displayName,
      authorizationEndpoint:
        connectionProviderManifest.oauth.authorizationEndpoint,
      tokenEndpoint: connectionProviderManifest.oauth.tokenEndpoint,
      revokeEndpoint: connectionProviderManifest.oauth.revokeEndpoint ?? null,
      scopes: connectionProviderManifest.oauth.scopes,
      clientIdVariable: connectionProviderManifest.oauth.clientIdVariable,
      clientSecretVariable:
        connectionProviderManifest.oauth.clientSecretVariable,
      authorizationParams:
        connectionProviderManifest.oauth.authorizationParams ?? null,
      tokenRequestContentType:
        connectionProviderManifest.oauth.tokenRequestContentType ?? 'json',
      usePkce: connectionProviderManifest.oauth.usePkce ?? true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
