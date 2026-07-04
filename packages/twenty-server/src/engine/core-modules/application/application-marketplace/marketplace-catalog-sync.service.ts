import { Injectable, Logger } from '@nestjs/common';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { resolveRegistryManifestAssetUrls } from 'src/engine/core-modules/application/application-registration/utils/resolve-registry-manifest-asset-urls.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly marketplaceService: MarketplaceService,
    private readonly twentyConfigService: TwentyConfigService,
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

        const universalIdentifier =
          fetchedManifest.application.universalIdentifier;

        const manifestWithResolvedUrls = resolveRegistryManifestAssetUrls({
          manifest: fetchedManifest,
          packageName: pkg.name,
          version: pkg.version,
          cdnBaseUrl: this.twentyConfigService.get('APP_REGISTRY_CDN_URL'),
        });

        await this.applicationRegistrationService.upsertFromCatalog({
          universalIdentifier,
          name: fetchedManifest.application.displayName ?? pkg.name,
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: pkg.name,
          latestAvailableVersion: pkg.version ?? null,
          manifest: manifestWithResolvedUrls,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync registry app "${pkg.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
