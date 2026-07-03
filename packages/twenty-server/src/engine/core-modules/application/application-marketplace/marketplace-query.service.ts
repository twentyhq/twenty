import { Injectable, Logger } from '@nestjs/common';

import { type RoleManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import {
  type ApplicationRegistrationCatalogCard,
  ApplicationRegistrationService,
} from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { MarketplaceAppRoleDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-role.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
export class MarketplaceQueryService {
  private readonly logger = new Logger(MarketplaceQueryService.name);
  private hasSyncBeenEnqueued = false;

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    const registrations =
      await this.applicationRegistrationService.findManyListedCatalogCards();

    if (registrations.length === 0) {
      if (!this.hasSyncBeenEnqueued) {
        this.hasSyncBeenEnqueued = true;
        this.logger.log(
          'No marketplace registrations found, enqueuing one-time sync job',
        );
        await this.messageQueueService.add(
          MarketplaceCatalogSyncCronJob.name,
          {},
          { id: 'marketplace-catalog-sync' }, // Avoids triggering multiple pending jobs
        );
      }

      return [];
    }

    const configuredStatuses =
      await this.applicationRegistrationVariableService.isConfiguredBatch(
        registrations.map((registration) => registration.id),
      );

    return registrations
      .filter((registration) => configuredStatuses.get(registration.id) ?? true)
      .map((registration) => this.toMarketplaceAppDTO(registration));
  }

  async findMarketplaceAppDetail(
    universalIdentifier: string,
  ): Promise<MarketplaceAppDetailDTO> {
    const registration =
      await this.findRegistrationByUniversalIdentifier(universalIdentifier);

    return this.toMarketplaceAppDetailDTO(registration);
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

  private toMarketplaceAppDTO(
    catalogCard: ApplicationRegistrationCatalogCard,
  ): MarketplaceAppDTO {
    return {
      id: catalogCard.universalIdentifier,
      name: catalogCard.name,
      description: catalogCard.description ?? '',
      author: catalogCard.author ?? 'Unknown',
      category: catalogCard.category ?? '',
      logo: catalogCard.logoUrl ?? undefined,
      sourcePackage: catalogCard.sourcePackage ?? undefined,
      isFeatured: catalogCard.isFeatured,
    };
  }

  private toMarketplaceAppDetailDTO(
    registration: ApplicationRegistrationEntity,
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
        registration.manifest?.application?.description ??
        undefined,
      author:
        registration.author ??
        registration.manifest?.application?.author ??
        undefined,
      category:
        registration.category ??
        registration.manifest?.application?.category ??
        undefined,
      logo: registration.logoUrl ?? undefined,
      websiteUrl:
        registration.websiteUrl ??
        registration.manifest?.application?.websiteUrl ??
        undefined,
      aboutDescription:
        registration.aboutDescription ??
        registration.manifest?.application?.aboutDescription ??
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
      screenshots: isNonEmptyArray(registration.screenshots)
        ? registration.screenshots
        : (registration.manifest?.application?.screenshots ?? []),
      defaultRoleUniversalIdentifier:
        registration.manifest?.application?.defaultRoleUniversalIdentifier,
      roles: registration.manifest?.roles?.map((role) =>
        this.toMarketplaceAppRoleDTO(role),
      ),
      manifest: registration.manifest ?? undefined,
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
