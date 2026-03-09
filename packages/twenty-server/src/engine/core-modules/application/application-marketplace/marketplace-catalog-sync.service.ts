import { Injectable, Logger } from '@nestjs/common';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { MARKETPLACE_CATALOG_INDEX } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-catalog-index.constant';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  async syncCatalog(): Promise<void> {
    await this.syncCuratedApps();
    await this.syncNpmApps();

    this.logger.log('Marketplace catalog sync completed');
  }

  private async syncCuratedApps(): Promise<void> {
    for (const entry of MARKETPLACE_CATALOG_INDEX) {
      try {
        await this.applicationRegistrationService.upsertFromCatalog({
          universalIdentifier: entry.universalIdentifier,
          name: entry.name,
          description:
            entry.richDisplayData.aboutDescription ?? entry.description,
          author: entry.author,
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: entry.sourcePackage,
          logoUrl: entry.logoUrl ?? null,
          websiteUrl: entry.websiteUrl ?? null,
          termsUrl: entry.termsUrl ?? null,
          latestAvailableVersion: entry.richDisplayData.version ?? null,
          isListed: true,
          isFeatured: entry.isFeatured,
          marketplaceDisplayData: entry.richDisplayData,
          ownerWorkspaceId: null,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync curated app "${entry.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async syncNpmApps(): Promise<void> {
    const npmApps = await this.marketplaceService.fetchAppsFromNpmRegistry();

    const curatedIdentifiers = new Set(
      MARKETPLACE_CATALOG_INDEX.map((entry) => entry.universalIdentifier),
    );

    for (const app of npmApps) {
      if (curatedIdentifiers.has(app.id)) {
        continue;
      }

      try {
        await this.applicationRegistrationService.upsertFromCatalog({
          universalIdentifier: app.id,
          name: app.name,
          description: app.description,
          author: app.author,
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: app.sourcePackage ?? app.name,
          logoUrl: null,
          websiteUrl: app.websiteUrl ?? null,
          termsUrl: null,
          latestAvailableVersion: app.version ?? null,
          isListed: true,
          isFeatured: false,
          marketplaceDisplayData: null,
          ownerWorkspaceId: null,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync npm app "${app.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
