import { Injectable } from '@nestjs/common';

import { isUUID } from 'class-validator';
import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { buildApplicationContentFromManifest } from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-manifest.util';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { MARKETPLACE_BUILT_IN_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-applications.constant';
import { findMarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-built-in-application.util';
import { toMarketplaceBuiltInAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-built-in-app-detail-dto.util';
import { toMarketplaceBuiltInAppDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-built-in-app-dto.util';
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
    shouldIncludeBuiltInApplications = false,
  }: {
    universalIdentifiers?: string[];
    isListed?: boolean;
    shouldIncludeBuiltInApplications?: boolean;
  } = {}): Promise<MarketplaceAppDTO[]> {
    const appsByUniversalIdentifier =
      (await this.coreEntityCacheService.get(
        'marketplaceCatalog',
        MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
      )) ?? {};

    const catalogApps = isNonEmptyArray(universalIdentifiers)
      ? universalIdentifiers
          .map(
            (universalIdentifier) =>
              appsByUniversalIdentifier[universalIdentifier],
          )
          .filter(isDefined)
      : Object.values(appsByUniversalIdentifier);

    const apps = shouldIncludeBuiltInApplications
      ? [...this.findBuiltInApps(universalIdentifiers), ...catalogApps]
      : catalogApps;

    if (!isDefined(isListed)) {
      return apps;
    }

    return apps.filter((app) => app.isListed === isListed);
  }

  private findBuiltInApps(
    universalIdentifiers?: string[],
  ): MarketplaceAppDTO[] {
    const frontBaseUrl = this.domainServerConfigService.getBaseUrl();
    const builtInApplications = isNonEmptyArray(universalIdentifiers)
      ? universalIdentifiers
          .map(findMarketplaceBuiltInApplication)
          .filter(isDefined)
      : MARKETPLACE_BUILT_IN_APPLICATIONS;

    return builtInApplications.map((builtInApplication) =>
      toMarketplaceBuiltInAppDTO({ builtInApplication, frontBaseUrl }),
    );
  }

  async findMarketplaceAppDetail(
    universalIdentifier: string,
    {
      shouldIncludeBuiltInApplications = false,
    }: { shouldIncludeBuiltInApplications?: boolean } = {},
  ): Promise<MarketplaceAppDetailDTO> {
    const builtInApplication = shouldIncludeBuiltInApplications
      ? findMarketplaceBuiltInApplication(universalIdentifier)
      : undefined;

    if (isDefined(builtInApplication)) {
      return toMarketplaceBuiltInAppDetailDTO({
        builtInApplication,
        frontBaseUrl: this.domainServerConfigService.getBaseUrl(),
      });
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
    role: RoleManifest;
    applicationUniversalIdentifier: string;
  }): MarketplaceAppRoleDTO {
    return {
      universalIdentifier: role.universalIdentifier,
      label: role.label,
      description: role.description,
      icon: role.icon,
      canUpdateAllSettings: role.canUpdateAllSettings,
      canAccessAllTools: role.canAccessAllTools,
      canReadAllObjectRecords: role.canReadAllObjectRecords,
      canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
      permissionFlagUniversalIdentifiers:
        role.permissionFlagUniversalIdentifiers,
      objectPermissions: role.objectPermissions?.map((permission) => ({
        universalIdentifier:
          permission.universalIdentifier ??
          getObjectPermissionUniversalIdentifier({
            applicationUniversalIdentifier,
            roleUniversalIdentifier: role.universalIdentifier,
            objectUniversalIdentifier: permission.objectUniversalIdentifier,
          }),
        objectUniversalIdentifier: permission.objectUniversalIdentifier,
        canReadObjectRecords: permission.canReadObjectRecords,
        canUpdateObjectRecords: permission.canUpdateObjectRecords,
        canSoftDeleteObjectRecords: permission.canSoftDeleteObjectRecords,
        canDestroyObjectRecords: permission.canDestroyObjectRecords,
      })),
      fieldPermissions: role.fieldPermissions?.map((permission) => ({
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
      })),
    };
  }
}
