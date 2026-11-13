import { Injectable } from '@nestjs/common';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { MARKETPLACE_FEATURED_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-featured-applications.constant';
import { type MarketplaceCatalogApp } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-catalog-app.type';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import {
  type ApplicationRegistrationCatalogCard,
  ApplicationRegistrationService,
} from 'src/engine/core-modules/application/application-registration/application-registration.service';

const FEATURED_POSITION_BY_UNIVERSAL_IDENTIFIER = new Map(
  MARKETPLACE_FEATURED_APPLICATIONS.map(({ universalIdentifier, position }) => [
    universalIdentifier,
    position,
  ]),
);

const compareCatalogCards = (
  cardA: ApplicationRegistrationCatalogCard,
  cardB: ApplicationRegistrationCatalogCard,
): number => {
  const positionA =
    FEATURED_POSITION_BY_UNIVERSAL_IDENTIFIER.get(cardA.universalIdentifier) ??
    Number.POSITIVE_INFINITY;
  const positionB =
    FEATURED_POSITION_BY_UNIVERSAL_IDENTIFIER.get(cardB.universalIdentifier) ??
    Number.POSITIVE_INFINITY;

  if (positionA !== positionB) {
    return positionA - positionB;
  }

  return cardA.name.trim().localeCompare(cardB.name.trim(), undefined, {
    sensitivity: 'base',
  });
};

@Injectable()
@CoreEntityCache('marketplaceCatalog')
export class MarketplaceCatalogCacheProviderService extends CoreEntityCacheProvider<
  Record<string, MarketplaceCatalogApp>
> {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
  ) {
    super();
  }

  async computeForCache(): Promise<Record<string, MarketplaceCatalogApp>> {
    const registrations =
      await this.applicationRegistrationService.findManyCatalogCards();

    if (registrations.length === 0) {
      return {};
    }

    const configuredStatuses =
      await this.applicationRegistrationVariableService.isConfiguredBatch(
        registrations.map((registration) => registration.id),
      );

    const configuredRegistrations = registrations.filter(
      (registration) => configuredStatuses.get(registration.id) ?? true,
    );

    const serverCompatibilities =
      await this.applicationVersionValidationService.validateManyServerCompatibilities(
        configuredRegistrations.map(
          (registration) =>
            registration.requiredServerVersionRange ?? undefined,
        ),
      );

    return configuredRegistrations
      .filter((_registration, index) => serverCompatibilities[index].compatible)
      .sort(compareCatalogCards)
      .reduce<Record<string, MarketplaceCatalogApp>>(
        (accumulator, registration) => {
          accumulator[registration.universalIdentifier] =
            this.toMarketplaceCatalogApp(registration);

          return accumulator;
        },
        {},
      );
  }

  private toMarketplaceCatalogApp(
    catalogCard: ApplicationRegistrationCatalogCard,
  ): MarketplaceCatalogApp {
    return {
      id: catalogCard.universalIdentifier,
      name: catalogCard.name,
      description: catalogCard.description ?? '',
      author: catalogCard.author ?? '',
      category: catalogCard.category ?? '',
      logoUrl: catalogCard.logoUrl ?? undefined,
      sourcePackage: catalogCard.sourcePackage ?? undefined,
      connectUrl: catalogCard.oAuthClient?.connectUrl,
      clientIdMetadataDocumentUrls:
        catalogCard.oAuthClient?.clientIdMetadataDocumentUrls,
      isListed: catalogCard.isListed,
    };
  }
}
