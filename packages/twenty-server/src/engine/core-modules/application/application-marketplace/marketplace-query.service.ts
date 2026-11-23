import { Injectable } from '@nestjs/common';

import { isUUID } from 'class-validator';
import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
  type LegacyCompliantRoleManifest,
  getReachableObjectPermissionsFromRoleManifest,
  getRecordsPermissionsFromRoleManifest,
  normalizeLegacyCompliantRoleManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isMcpServerBundledApplication } from 'src/engine/core-modules/application/application-bundled/utils/is-mcp-server-bundled-application.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { buildApplicationContentFromManifest } from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-manifest.util';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { MARKETPLACE_CONNECT_LISTINGS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-connect-listings.constant';
import { findMarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-connect-listing.util';
import { toMarketplaceConnectListingAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-connect-listing-app-detail-dto.util';
import { toMarketplaceConnectListingAppDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-connect-listing-app-dto.util';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { doesApplicationBillCredits } from 'src/engine/core-modules/application/utils/does-application-bill-credits.util';
import { toApplicationCapabilities } from 'src/engine/core-modules/application/utils/to-application-capabilities.util';
import { toRequestedIframeMediaPermissionsOrThrow } from 'src/engine/core-modules/application/utils/to-requested-iframe-media-permissions-or-throw.util';
import { MarketplaceAppRoleDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-role.dto';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { getApplicationAuthorDisplayName } from 'src/engine/core-modules/application/application-registration/utils/get-application-author-display-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

@Injectable()
export class MarketplaceQueryService {
  constructor(
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly applicationService: ApplicationService,
    private readonly domainServerConfigService: DomainServerConfigService,
  ) {}

  async findManyMarketplaceApps({
    universalIdentifiers,
    isListed,
    shouldIncludeConnectListings = false,
    shouldIncludeMcpServerApplications = false,
  }: {
    universalIdentifiers?: string[];
    isListed?: boolean;
    shouldIncludeConnectListings?: boolean;
    shouldIncludeMcpServerApplications?: boolean;
  } = {}): Promise<MarketplaceAppDTO[]> {
    const appsByUniversalIdentifier =
      (await this.coreEntityCacheService.get(
        'marketplaceCatalog',
        MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
      )) ?? {};

    const catalogApps = (
      isNonEmptyArray(universalIdentifiers)
        ? universalIdentifiers
            .map(
              (universalIdentifier) =>
                appsByUniversalIdentifier[universalIdentifier],
            )
            .filter(isDefined)
        : Object.values(appsByUniversalIdentifier)
    )
      .filter(
        (app) =>
          shouldIncludeMcpServerApplications ||
          !isMcpServerBundledApplication(app.id),
      )
      // Entries cached before the field existed carry no value
      .map((app) => ({ ...app, hasMcpServers: app.hasMcpServers ?? false }));

    const apps = shouldIncludeConnectListings
      ? [...this.findConnectListingApps(universalIdentifiers), ...catalogApps]
      : catalogApps;

    if (!isDefined(isListed)) {
      return apps;
    }

    return apps.filter((app) => app.isListed === isListed);
  }

  private findConnectListingApps(
    universalIdentifiers?: string[],
  ): MarketplaceAppDTO[] {
    const frontBaseUrl = this.domainServerConfigService.getBaseUrl();
    const connectListings = isNonEmptyArray(universalIdentifiers)
      ? universalIdentifiers
          .map(findMarketplaceConnectListing)
          .filter(isDefined)
      : MARKETPLACE_CONNECT_LISTINGS;

    return connectListings.map((connectListing) =>
      toMarketplaceConnectListingAppDTO({ connectListing, frontBaseUrl }),
    );
  }

  async findMarketplaceAppDetail({
    universalIdentifier,
    shouldIncludeConnectListings = false,
    shouldIncludeMcpServerApplications = false,
  }: {
    universalIdentifier: string;
    shouldIncludeConnectListings?: boolean;
    shouldIncludeMcpServerApplications?: boolean;
  }): Promise<MarketplaceAppDetailDTO> {
    const connectListing = shouldIncludeConnectListings
      ? findMarketplaceConnectListing(universalIdentifier)
      : undefined;

    if (isDefined(connectListing)) {
      return toMarketplaceConnectListingAppDetailDTO({
        connectListing,
        frontBaseUrl: this.domainServerConfigService.getBaseUrl(),
      });
    }

    if (
      !shouldIncludeMcpServerApplications &&
      isMcpServerBundledApplication(universalIdentifier)
    ) {
      throw new ApplicationRegistrationException(
        `No application registration found for identifier "${universalIdentifier}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    const registration =
      await this.findRegistrationByUniversalIdentifier(universalIdentifier);

    return this.toMarketplaceAppDetailDTO(registration);
  }

  async findRegistrationByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration = isUUID(universalIdentifier)
      ? await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
          universalIdentifier,
        )
      : null;

    if (!isDefined(registration)) {
      throw new ApplicationRegistrationException(
        `No application registration found for identifier "${universalIdentifier}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  private async toMarketplaceAppDetailDTO(
    registration: ApplicationRegistrationEntity,
  ): Promise<MarketplaceAppDetailDTO> {
    const galleryImageUrls =
      this.applicationRegistrationAssetUrlService.buildGalleryImageUrls(
        registration,
      );
    const manifest = registration.manifest;

    const installCount =
      await this.applicationService.countInstalledWorkspacesForApplication(
        registration.universalIdentifier,
      );

    return {
      id: registration.id,
      universalIdentifier: registration.universalIdentifier,
      name: registration.name,
      sourceType: registration.sourceType,
      sourcePackage: registration.sourcePackage ?? undefined,
      latestAvailableVersion: registration.latestAvailableVersion ?? undefined,
      isListed: registration.isListed,
      description:
        registration.description ??
        registration.manifest?.application?.description ??
        undefined,
      author:
        getApplicationAuthorDisplayName(
          registration.author ?? registration.manifest?.application?.author,
        ) ?? undefined,
      category:
        registration.category ??
        registration.manifest?.application?.category ??
        undefined,
      logoUrl:
        this.applicationRegistrationAssetUrlService.buildLogoUrl(
          registration,
        ) ?? undefined,
      websiteUrl:
        registration.websiteUrl ??
        registration.manifest?.application?.websiteUrl ??
        undefined,
      aboutDescription:
        registration.aboutDescription ??
        registration.manifest?.application?.aboutDescription ??
        undefined,
      pricingDescription:
        registration.pricingDescription ??
        registration.manifest?.application?.billing?.description ??
        undefined,
      termsUrl:
        registration.termsUrl ??
        registration.manifest?.application?.termsUrl ??
        undefined,
      emailSupport:
        registration.emailSupport ??
        registration.manifest?.application?.emailSupport ??
        undefined,
      issueReportUrl:
        registration.issueReportUrl ??
        registration.manifest?.application?.issueReportUrl ??
        undefined,
      screenshots: galleryImageUrls,
      galleryImages: galleryImageUrls,
      installCount,
      defaultRoleUniversalIdentifier:
        registration.manifest?.application?.defaultRoleUniversalIdentifier,
      roles: isDefined(manifest)
        ? manifest.roles?.map((role) =>
            this.toMarketplaceAppRoleDTO({
              role,
              applicationUniversalIdentifier:
                manifest.application?.universalIdentifier ??
                registration.universalIdentifier,
            }),
          )
        : undefined,
      objects: manifest?.objects?.map(
        ({ universalIdentifier, labelSingular, labelPlural }) => ({
          universalIdentifier,
          labelSingular,
          labelPlural,
        }),
      ),
      requestedCapabilities: toApplicationCapabilities(
        manifest?.application?.requestedCapabilities,
      ),
      requestedIframeMediaPermissions: toRequestedIframeMediaPermissionsOrThrow(
        manifest?.application?.requestedIframeMediaPermissions,
      ),
      billsCredits: doesApplicationBillCredits(manifest?.application?.billing),
      content: isDefined(manifest)
        ? buildApplicationContentFromManifest(manifest)
        : undefined,
      manifest: registration.manifest ?? undefined,
    };
  }

  private toMarketplaceAppRoleDTO({
    role,
    applicationUniversalIdentifier,
  }: {
    role: LegacyCompliantRoleManifest;
    applicationUniversalIdentifier: string;
  }): MarketplaceAppRoleDTO {
    const normalizedRole = normalizeLegacyCompliantRoleManifest({
      role,
      applicationUniversalIdentifier,
    });
    const recordsPermissions = getRecordsPermissionsFromRoleManifest({
      role: normalizedRole,
    });
    const objectUniversalIdentifiersWithRules = new Set(
      recordsPermissions.rowLevelPermissionRules.map(
        (rule) => rule.objectUniversalIdentifier,
      ),
    );

    return {
      universalIdentifier: role.universalIdentifier,
      label: role.label,
      description: role.description,
      icon: role.icon,
      canUpdateAllSettings: role.canUpdateAllSettings,
      canAccessAllTools: role.canAccessAllTools,
      canReadAllObjectRecords: recordsPermissions.canReadAllObjectRecords,
      canUpdateAllObjectRecords: recordsPermissions.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords:
        recordsPermissions.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: recordsPermissions.canDestroyAllObjectRecords,
      permissionFlagUniversalIdentifiers:
        role.permissionFlagUniversalIdentifiers,
      objectPermissions: recordsPermissions.objectPermissions.map(
        (permission) => {
          const { objectUniversalIdentifier } = permission;
          // The listing has no rules yet, so an object reached through rules shows what they grant
          const reachablePermissions = objectUniversalIdentifiersWithRules.has(
            objectUniversalIdentifier,
          )
            ? getReachableObjectPermissionsFromRoleManifest({
                role: normalizedRole,
                objectUniversalIdentifier,
              })
            : undefined;

          return {
            universalIdentifier:
              permission.universalIdentifier ??
              getObjectPermissionUniversalIdentifier({
                applicationUniversalIdentifier,
                roleUniversalIdentifier: role.universalIdentifier,
                objectUniversalIdentifier,
              }),
            objectUniversalIdentifier,
            canReadObjectRecords:
              reachablePermissions?.canReadObjectRecords ??
              permission.canReadObjectRecords,
            canUpdateObjectRecords:
              reachablePermissions?.canUpdateObjectRecords ??
              permission.canUpdateObjectRecords,
            canSoftDeleteObjectRecords:
              reachablePermissions?.canSoftDeleteObjectRecords ??
              permission.canSoftDeleteObjectRecords,
            canDestroyObjectRecords:
              reachablePermissions?.canDestroyObjectRecords ??
              permission.canDestroyObjectRecords,
          };
        },
      ),
      fieldPermissions: recordsPermissions.fieldPermissions.map(
        (permission) => ({
          universalIdentifier:
            permission.universalIdentifier ??
            getFieldPermissionUniversalIdentifier({
              applicationUniversalIdentifier,
              roleUniversalIdentifier: role.universalIdentifier,
              fieldUniversalIdentifier: permission.fieldUniversalIdentifier,
            }),
          objectUniversalIdentifier: permission.objectUniversalIdentifier,
          fieldUniversalIdentifier: permission.fieldUniversalIdentifier,
          canReadFieldValue: permission.canReadFieldValue,
          canUpdateFieldValue: permission.canUpdateFieldValue,
        }),
      ),
    };
  }
}
