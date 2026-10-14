import { Injectable } from '@nestjs/common';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { MARKETPLACE_VETTED_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-vetted-applications.constant';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import {
  type ApplicationRegistrationCatalogCard,
  ApplicationRegistrationService,
} from 'src/engine/core-modules/application/application-registration/application-registration.service';

const VETTED_POSITION_BY_UNIVERSAL_IDENTIFIER = new Map(
  MARKETPLACE_VETTED_APPLICATIONS.map(({ universalIdentifier, position }) => [
    universalIdentifier,
    position,
  ]),
);

const compareCatalogCards = (
  cardA: ApplicationRegistrationCatalogCard,
  cardB: ApplicationRegistrationCatalogCard,
): number => {
  const positionA =
    VETTED_POSITION_BY_UNIVERSAL_IDENTIFIER.get(cardA.universalIdentifier) ??
    Number.POSITIVE_INFINITY;
  const positionB =
    VETTED_POSITION_BY_UNIVERSAL_IDENTIFIER.get(cardB.universalIdentifier) ??
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
  Record<string, MarketplaceAppDTO>
> {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
  ) {
    super();
  }

  async computeForCache(): Promise<Record<string, MarketplaceAppDTO>> {
    const registrations =
      await this.applicationRegistrationService.findManyListedCatalogCards();

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
      .reduce<Record<string, MarketplaceAppDTO>>(
        (accumulator, registration) => {
          accumulator[registration.universalIdentifier] =
            this.toMarketplaceAppDTO(registration);

          return accumulator;
        },
        {},
      );
  }

  private toMarketplaceAppDTO(
    catalogCard: ApplicationRegistrationCatalogCard,
  ): MarketplaceAppDTO {
    return {
      id: catalogCard.universalIdentifier,
      name: catalogCard.name,
      description: catalogCard.description ?? '',
      author: catalogCard.author ?? '',
      category: catalogCard.category ?? '',
      logoUrl: catalogCard.logoUrl ?? undefined,
      sourcePackage: catalogCard.sourcePackage ?? undefined,
      isVetted: catalogCard.isVetted,
    };
  }
}
