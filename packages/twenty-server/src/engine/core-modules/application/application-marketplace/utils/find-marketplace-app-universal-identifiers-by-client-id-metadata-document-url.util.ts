import { isDefined } from 'twenty-shared/utils';

import { type MarketplaceCatalogApp } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-catalog-app.type';

// Anyone can publish a package that declares another client's document, so only listed apps count and a contested URL names no app
export const findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl =
  (
    catalogApps: Pick<
      MarketplaceCatalogApp,
      'id' | 'isListed' | 'clientIdMetadataDocumentUrls'
    >[],
  ): Record<string, string> => {
    const universalIdentifiersByUrl = new Map<string, Set<string>>();

    for (const catalogApp of catalogApps) {
      if (!catalogApp.isListed) {
        continue;
      }

      for (const url of catalogApp.clientIdMetadataDocumentUrls ?? []) {
        const universalIdentifiers =
          universalIdentifiersByUrl.get(url) ?? new Set<string>();

        universalIdentifiers.add(catalogApp.id);
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
