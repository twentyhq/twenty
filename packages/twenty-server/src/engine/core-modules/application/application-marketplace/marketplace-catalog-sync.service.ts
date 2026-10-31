import { Injectable, Logger } from '@nestjs/common';

import { readFile } from 'fs/promises';
import path from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import {
  MarketplaceService,
  type RegistryPackageInfo,
} from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WELL_KNOWN_OAUTH_CLIENT_ASSETS_PATH } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-client-assets-path.constant';
import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';
import { areRegistrationAssetsStored } from 'src/engine/core-modules/application/application-registration/utils/are-registration-assets-stored.util';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly applicationRegistrationAssetService: ApplicationRegistrationAssetService,
    private readonly applicationRegistrationVersionService: ApplicationRegistrationVersionService,
    private readonly marketplaceService: MarketplaceService,
    private readonly applicationPackageFetcherService: ApplicationPackageFetcherService,
    private readonly wellKnownOAuthClientRegistrationService: WellKnownOAuthClientRegistrationService,
  ) {}

  async syncCatalog(): Promise<void> {
    // Ahead of the registry so an unreachable registry cannot hold them back
    await this.syncWellKnownOAuthClients();
    await this.syncRegistryApps();

    this.logger.log('Marketplace catalog sync completed');
  }

  private async syncWellKnownOAuthClients(): Promise<void> {
    for (const wellKnownOAuthClient of WELL_KNOWN_OAUTH_CLIENTS) {
      try {
        const registration =
          await this.wellKnownOAuthClientRegistrationService.syncRegistration(
            wellKnownOAuthClient,
          );

        await this.applicationRegistrationAssetService.storeRegistrationAssets({
          applicationRegistrationId: registration.id,
          manifestApplication: { logo: wellKnownOAuthClient.logo },
          readAsset: (assetPath) =>
            readFile(path.join(WELL_KNOWN_OAUTH_CLIENT_ASSETS_PATH, assetPath)),
          skipAlreadyStoredPaths: true,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync the ${wellKnownOAuthClient.name} application registration: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    await this.applicationRegistrationService.invalidateMarketplaceAppsCache();
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

        if (!isValidUuid(universalIdentifier)) {
          this.logger.warn(
            `Skipping ${pkg.name}: universal identifier ${universalIdentifier} is not a valid UUID`,
          );
          continue;
        }

        const previousVersion = (
          await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
            universalIdentifier,
          )
        )?.latestAvailableVersion;

        const registration =
          await this.applicationRegistrationService.upsertFromCatalog({
            universalIdentifier,
            name: fetchedManifest.application.displayName ?? pkg.name,
            sourceType: ApplicationRegistrationSourceType.NPM,
            sourcePackage: pkg.name,
            latestAvailableVersion: pkg.version ?? null,
            manifest: fetchedManifest,
          });

        if (!isDefined(registration)) {
          continue;
        }

        try {
          await this.recordCatalogVersion({
            registration,
            registryPackage: pkg,
          });
        } catch (error) {
          this.logger.error(
            `Failed to record version ${pkg.version} of registry app "${pkg.name}": ${error instanceof Error ? error.message : String(error)}`,
          );
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

  private async recordCatalogVersion({
    registration,
    registryPackage,
  }: {
    registration: Pick<ApplicationRegistrationEntity, 'id'>;
    registryPackage: RegistryPackageInfo;
  }): Promise<void> {
    if (!isNonEmptyString(registryPackage.version)) {
      return;
    }

    const recordedVersion =
      await this.applicationRegistrationVersionService.findOneByApplicationRegistrationIdAndVersion(
        {
          applicationRegistrationId: registration.id,
          version: registryPackage.version,
        },
      );

    if (isDefined(recordedVersion?.tarballUrl)) {
      return;
    }

    const tarballUrl =
      await this.applicationPackageFetcherService.findRegistryTarballUrl({
        packageName: registryPackage.name,
        version: registryPackage.version,
      });

    if (!isDefined(tarballUrl)) {
      this.logger.warn(
        `Version ${registryPackage.version} of ${registryPackage.name} left incomplete: registry gave no artifact details, retrying on the next sync`,
      );

      return;
    }

    await this.applicationRegistrationVersionService.ensureNpmVersion({
      applicationRegistrationId: registration.id,
      version: registryPackage.version,
      sourcePackage: registryPackage.name,
      tarballUrl,
    });
  }
}
