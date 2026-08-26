import { Injectable } from '@nestjs/common';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { type MarketplaceCatalogCachedApp } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-catalog-cached-app.type';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import {
  type ApplicationRegistrationCatalogCard,
  ApplicationRegistrationService,
} from 'src/engine/core-modules/application/application-registration/application-registration.service';

@Injectable()
@CoreEntityCache('marketplaceCatalog')
export class MarketplaceCatalogCacheProviderService extends CoreEntityCacheProvider<
  Record<string, MarketplaceCatalogCachedApp>
> {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
  ) {
    super();
  }

  async computeForCache(): Promise<
    Record<string, MarketplaceCatalogCachedApp>
  > {
    const registrations =
      await this.applicationRegistrationService.findManyListedCatalogCards();

    if (registrations.length === 0) {
      return {};
    }

    const configuredStatuses =
      await this.applicationRegistrationVariableService.isConfiguredBatch(
        registrations.map((registration) => registration.id),
      );

    return registrations
      .filter((registration) => configuredStatuses.get(registration.id) ?? true)
      .reduce<Record<string, MarketplaceCatalogCachedApp>>(
        (accumulator, registration) => {
          accumulator[registration.universalIdentifier] =
            this.toMarketplaceCatalogCachedApp(registration);

          return accumulator;
        },
        {},
      );
  }

  private toMarketplaceCatalogCachedApp(
    catalogCard: ApplicationRegistrationCatalogCard,
  ): MarketplaceCatalogCachedApp {
    return {
      id: catalogCard.universalIdentifier,
      name: catalogCard.name,
      description: catalogCard.description ?? '',
      author: catalogCard.author ?? 'Unknown',
      category: catalogCard.category ?? '',
      logoUrl: catalogCard.logoUrl ?? undefined,
      sourcePackage: catalogCard.sourcePackage ?? undefined,
      isVetted: catalogCard.isVetted,
      requiredServerVersionRange:
        catalogCard.requiredServerVersionRange ?? undefined,
    };
  }
}
