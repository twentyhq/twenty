import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { areRegistrationAssetsStored } from 'src/engine/core-modules/application/application-registration/utils/are-registration-assets-stored.util';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
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

        const universalIdentifier =
          fetchedManifest.application.universalIdentifier;

        const previousVersion = (
          await this.applicationRegistrationService.findOneByUniversalIdentifier(
            universalIdentifier,
          )
        )?.latestAvailableVersion;

        await this.applicationRegistrationService.upsertFromCatalog({
          universalIdentifier,
          name: fetchedManifest.application.displayName ?? pkg.name,
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: pkg.name,
          latestAvailableVersion: pkg.version ?? null,
          manifest: fetchedManifest,
        });

        const registration =
          await this.applicationRegistrationService.findOneByUniversalIdentifier(
            universalIdentifier,
          );

        if (!isDefined(registration)) {
          continue;
        }

        // Rehost the logo and gallery images from the registry CDN so display
        // urls are served from fileIds like every other source. Skipped when
        // the version is unchanged and the files are already stored; the
        // query-time url builder falls back to CDN urls until they are. On an
        // unchanged version, only assets missing a stored file are fetched.
        if (
          previousVersion !== pkg.version ||
          !areRegistrationAssetsStored(
            registration,
            fetchedManifest.application,
          )
        ) {
          await this.applicationRegistrationAssetService.storeRegistrationAssets(
            {
              applicationRegistrationId: registration.id,
              manifestApplication: fetchedManifest.application,
              readAsset: (path) =>
                this.marketplaceService.fetchAssetFromRegistryCdn(
                  pkg.name,
                  pkg.version,
                  path,
                ),
              skipAlreadyStoredPaths: previousVersion === pkg.version,
            },
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to sync registry app "${pkg.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
