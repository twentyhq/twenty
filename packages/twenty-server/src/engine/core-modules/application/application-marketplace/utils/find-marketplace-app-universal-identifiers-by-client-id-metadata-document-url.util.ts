import { type ApplicationOAuthClient } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type OAuthClientDeclaration = {
  universalIdentifier: string;
  isListed: boolean;
  oAuthClient: Pick<
    ApplicationOAuthClient,
    'clientIdMetadataDocumentUrls'
  > | null;
};

export const findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl =
  (declarations: OAuthClientDeclaration[]): Record<string, string> => {
    const universalIdentifiersByUrl = new Map<string, Set<string>>();

    for (const declaration of declarations) {
      if (!declaration.isListed) {
        continue;
      }

      for (const url of declaration.oAuthClient?.clientIdMetadataDocumentUrls ??
        []) {
        const universalIdentifiers =
          universalIdentifiersByUrl.get(url) ?? new Set<string>();

        universalIdentifiers.add(declaration.universalIdentifier);
        universalIdentifiersByUrl.set(url, universalIdentifiers);
      }
    }

    const universalIdentifierByUrl: Record<string, string> = {};

    for (const [url, universalIdentifiers] of universalIdentifiersByUrl) {
      const [universalIdentifier] = universalIdentifiers;

      if (universalIdentifiers.size === 1 && isDefined(universalIdentifier)) {
        universalIdentifierByUrl[url] = universalIdentifier;
      }
    }

    return universalIdentifierByUrl;
  };
