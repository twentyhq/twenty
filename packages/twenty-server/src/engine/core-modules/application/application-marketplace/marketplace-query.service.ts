import { Injectable } from '@nestjs/common';

import { type Manifest, type RoleManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { MarketplaceAppRoleDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-role.dto';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';

@Injectable()
export class MarketplaceQueryService {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async findManyMarketplaceApps(
    isFeatured?: boolean,
  ): Promise<MarketplaceAppDTO[]> {
    const appsByUniversalIdentifier =
      (await this.coreEntityCacheService.get(
        'marketplaceCatalog',
        MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
      )) ?? {};

    const apps = Object.values(appsByUniversalIdentifier);

    if (!isDefined(isFeatured)) {
      return apps;
    }

    return apps.filter((app) => app.isFeatured === isFeatured);
  }

  async findMarketplaceAppDetail(
    universalIdentifier: string,
  ): Promise<MarketplaceAppDetailDTO> {
    const registration =
      await this.findRegistrationByUniversalIdentifier(universalIdentifier);

    const manifest =
      await this.applicationRegistrationService.getManifest(registration);

    return this.toMarketplaceAppDetailDTO(registration, manifest);
  }

  async findRegistrationByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        universalIdentifier,
      );

    if (!isDefined(registration)) {
      throw new ApplicationRegistrationException(
        `No application registration found for identifier "${universalIdentifier}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  private toMarketplaceAppDetailDTO(
    registration: ApplicationRegistrationEntity,
    manifest: Manifest | null,
  ): MarketplaceAppDetailDTO {
    return {
      id: registration.id,
      universalIdentifier: registration.universalIdentifier,
      name: registration.name,
      sourceType: registration.sourceType,
      sourcePackage: registration.sourcePackage ?? undefined,
      latestAvailableVersion: registration.latestAvailableVersion ?? undefined,
      isListed: registration.isListed,
      isFeatured: registration.isFeatured,
      description:
        registration.description ??
        manifest?.application?.description ??
        undefined,
      author: registration.author ?? manifest?.application?.author ?? undefined,
      category:
        registration.category ?? manifest?.application?.category ?? undefined,
      logo: registration.logoUrl ?? undefined,
      websiteUrl:
        registration.websiteUrl ??
        manifest?.application?.websiteUrl ??
        undefined,
      aboutDescription:
        registration.aboutDescription ??
        manifest?.application?.aboutDescription ??
        undefined,
      termsUrl:
        registration.termsUrl ?? manifest?.application?.termsUrl ?? undefined,
      emailSupport:
        registration.emailSupport ??
        manifest?.application?.emailSupport ??
        undefined,
      issueReportUrl:
        registration.issueReportUrl ??
        manifest?.application?.issueReportUrl ??
        undefined,
      screenshots: isNonEmptyArray(registration.screenshots)
        ? registration.screenshots
        : (manifest?.application?.screenshots ?? []),
      defaultRoleUniversalIdentifier:
        manifest?.application?.defaultRoleUniversalIdentifier,
      roles: manifest?.roles?.map((role) => this.toMarketplaceAppRoleDTO(role)),
      manifest: manifest ?? undefined,
    };
  }

  private toMarketplaceAppRoleDTO(role: RoleManifest): MarketplaceAppRoleDTO {
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
        universalIdentifier: permission.universalIdentifier,
        objectUniversalIdentifier: permission.objectUniversalIdentifier,
        canReadObjectRecords: permission.canReadObjectRecords,
        canUpdateObjectRecords: permission.canUpdateObjectRecords,
        canSoftDeleteObjectRecords: permission.canSoftDeleteObjectRecords,
        canDestroyObjectRecords: permission.canDestroyObjectRecords,
      })),
      fieldPermissions: role.fieldPermissions?.map((permission) => ({
        universalIdentifier: permission.universalIdentifier,
        objectUniversalIdentifier: permission.objectUniversalIdentifier,
        fieldUniversalIdentifier: permission.fieldUniversalIdentifier,
        canReadFieldValue: permission.canReadFieldValue,
        canUpdateFieldValue: permission.canUpdateFieldValue,
      })),
    };
  }
}
