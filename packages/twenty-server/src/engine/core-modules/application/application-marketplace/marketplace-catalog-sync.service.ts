import { Injectable, Logger } from '@nestjs/common';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { resolveManifestAssetUrls } from 'src/engine/core-modules/application/application-marketplace/utils/resolve-manifest-asset-urls.util';
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

    for (const pkg of packages) {
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

        const aboutDescription =
          fetchedManifest.application.aboutDescription ??
          (await this.marketplaceService.fetchReadmeFromRegistryCdn(
            pkg.name,
            pkg.version,
          ));

        const manifest = aboutDescription
          ? {
              ...fetchedManifest,
              application: {
                ...fetchedManifest.application,
                aboutDescription,
              },
            }
          : fetchedManifest;

        const cdnBaseUrl = this.twentyConfigService.get('APP_REGISTRY_CDN_URL');

        const manifestWithResolvedUrls = resolveManifestAssetUrls(
          manifest,
          (filePath) =>
            buildRegistryCdnUrl({
              cdnBaseUrl,
              packageName: pkg.name,
              version: pkg.version,
              filePath,
            }),
        );

        await this.applicationRegistrationService.upsertFromCatalog({
          universalIdentifier,
          name: manifest.application.displayName ?? pkg.name,
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
