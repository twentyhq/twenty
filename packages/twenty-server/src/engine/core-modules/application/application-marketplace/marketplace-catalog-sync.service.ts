import { Injectable, Logger } from '@nestjs/common';

import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { ApplicationCatalogRegistrationService } from 'src/engine/core-modules/application/application-registration/application-catalog-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    private readonly applicationCatalogRegistrationService: ApplicationCatalogRegistrationService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  async syncCatalog(): Promise<void> {
    await this.syncRegistryApps();

    this.logger.log('Marketplace catalog sync completed');
  }

  private async syncRegistryApps(): Promise<void> {
    const packages = await this.marketplaceService.fetchAppsFromRegistry();

    this.logger.log(`${packages.length} packages detected`);

    for (const pkg of packages) {
      this.logger.log(`Synchronizing ${pkg.name}...`);
      try {
        const fetchedManifest =
          await this.marketplaceService.fetchManifestFromRegistryCdn(
            pkg.name,
            pkg.version,
          );

        if (!fetchedManifest) {
          this.logger.debug(`Skipping ${pkg.name}: no manifest found on CDN`);
          continue;
        }

        // Assets are rehosted from the registry CDN so display urls are served
        // from fileIds like every other source; the query-time url builder
        // falls back to CDN urls until they are stored.
        await this.applicationCatalogRegistrationService.registerPublishedVersion(
          {
            universalIdentifier:
              fetchedManifest.application.universalIdentifier,
            name: fetchedManifest.application.displayName ?? pkg.name,
            sourceType: ApplicationRegistrationSourceType.NPM,
            sourcePackage: pkg.name,
            latestAvailableVersion: pkg.version ?? null,
            manifest: fetchedManifest,
            readAsset: (path) =>
              this.marketplaceService.fetchAssetFromRegistryCdn(
                pkg.name,
                pkg.version,
                path,
              ),
            canReuseStoredAssets: true,
          },
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync registry app "${pkg.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
