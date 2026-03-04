import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ApplicationRegistrationEntity,
  AppRegistrationSourceType,
} from 'src/engine/core-modules/application-registration/application-registration.entity';
import { MARKETPLACE_CATALOG_INDEX } from 'src/engine/core-modules/marketplace/constants/marketplace-catalog-index.constant';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceAppDTO } from 'src/engine/core-modules/marketplace/dtos/marketplace-app.dto';
import { MarketplaceService } from 'src/engine/core-modules/marketplace/services/marketplace.service';
import { type MarketplaceDisplayData } from 'src/engine/core-modules/marketplace/types/marketplace-display-data.type';
import { getAdminWorkspaceId } from 'src/engine/core-modules/marketplace/utils/get-admin-workspace-id.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
export class MarketplaceCatalogSyncService {
  private readonly logger = new Logger(MarketplaceCatalogSyncService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly marketplaceService: MarketplaceService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async syncCatalog(): Promise<void> {
    const dataSource = this.appRegistrationRepository.manager.connection;
    const adminWorkspaceId = await getAdminWorkspaceId(dataSource);

    if (!isDefined(adminWorkspaceId)) {
      this.logger.warn(
        'No admin workspace found. Skipping marketplace catalog sync.',
      );

      return;
    }

    await this.syncCuratedApps(adminWorkspaceId);
    await this.syncNpmApps(adminWorkspaceId);

    this.logger.log('Marketplace catalog sync completed');
  }

  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    const registrations = await this.appRegistrationRepository.find({
      where: { sourceType: AppRegistrationSourceType.NPM },
    });

    if (registrations.length === 0) {
      this.logger.log(
        'No marketplace registrations found, enqueuing one-time sync job',
      );
      await this.messageQueueService.add(
        MarketplaceCatalogSyncCronJob.name,
        {},
      );

      return [];
    }

    return registrations.map((registration) =>
      this.toMarketplaceAppDTO(registration),
    );
  }

  async findRegistrationByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration = await this.appRegistrationRepository.findOne({
      where: { universalIdentifier },
    });

    if (!isDefined(registration)) {
      throw new ApplicationException(
        `No application registration found for identifier "${universalIdentifier}"`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async findOrCreateNpmRegistration(params: {
    packageName: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const existing = await this.appRegistrationRepository.findOne({
      where: { sourcePackage: params.packageName },
    });

    if (isDefined(existing)) {
      return existing;
    }

    this.logger.log(
      `Creating new registration for npm package "${params.packageName}"`,
    );

    const registration = this.appRegistrationRepository.create({
      universalIdentifier: v4(),
      name: params.packageName,
      sourceType: AppRegistrationSourceType.NPM,
      sourcePackage: params.packageName,
      oAuthClientId: v4(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      workspaceId: params.workspaceId,
    });

    return this.appRegistrationRepository.save(registration);
  }

  toMarketplaceAppDTO(
    registration: ApplicationRegistrationEntity,
  ): MarketplaceAppDTO {
    const displayData = registration.marketplaceDisplayData;

    return {
      id: registration.universalIdentifier,
      name: registration.name,
      description: registration.description ?? '',
      icon: displayData?.icon ?? 'IconApps',
      version:
        displayData?.version ?? registration.latestAvailableVersion ?? '0.0.0',
      author: registration.author ?? 'Unknown',
      category: displayData?.category ?? '',
      logo: displayData?.logo,
      screenshots: displayData?.screenshots ?? [],
      aboutDescription:
        displayData?.aboutDescription ?? registration.description ?? '',
      providers: displayData?.providers ?? [],
      websiteUrl: registration.websiteUrl ?? undefined,
      termsUrl: registration.termsUrl ?? undefined,
      objects: displayData?.objects ?? [],
      fields: displayData?.fields ?? [],
      logicFunctions: displayData?.logicFunctions ?? [],
      frontComponents: displayData?.frontComponents ?? [],
      sourcePackage: registration.sourcePackage ?? undefined,
      defaultRole: displayData?.defaultRole,
    };
  }

  private async syncCuratedApps(workspaceId: string): Promise<void> {
    for (const entry of MARKETPLACE_CATALOG_INDEX) {
      try {
        await this.upsertRegistration({
          universalIdentifier: entry.universalIdentifier,
          name: entry.name,
          description:
            entry.richDisplayData.aboutDescription ?? entry.description,
          author: entry.author,
          sourceType: AppRegistrationSourceType.NPM,
          sourcePackage: entry.sourcePackage,
          logoUrl: entry.logoUrl ?? null,
          websiteUrl: entry.websiteUrl ?? null,
          termsUrl: entry.termsUrl ?? null,
          latestAvailableVersion: entry.richDisplayData.version ?? null,
          isFeatured: entry.isFeatured,
          marketplaceDisplayData: entry.richDisplayData,
          workspaceId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync curated app "${entry.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async syncNpmApps(workspaceId: string): Promise<void> {
    const npmApps = await this.marketplaceService.fetchAppsFromNpmRegistry();

    const curatedIdentifiers = new Set(
      MARKETPLACE_CATALOG_INDEX.map((entry) => entry.universalIdentifier),
    );

    for (const app of npmApps) {
      if (curatedIdentifiers.has(app.id)) {
        continue;
      }

      try {
        await this.upsertRegistration({
          universalIdentifier: app.id,
          name: app.name,
          description: app.description,
          author: app.author,
          sourceType: AppRegistrationSourceType.NPM,
          sourcePackage: app.sourcePackage ?? app.name,
          logoUrl: null,
          websiteUrl: app.websiteUrl ?? null,
          termsUrl: null,
          latestAvailableVersion: app.version ?? null,
          isFeatured: false,
          marketplaceDisplayData: null,
          workspaceId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to sync npm app "${app.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async upsertRegistration(params: {
    universalIdentifier: string;
    name: string;
    description: string;
    author: string;
    sourceType: AppRegistrationSourceType;
    sourcePackage: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    termsUrl: string | null;
    latestAvailableVersion: string | null;
    isFeatured: boolean;
    marketplaceDisplayData: MarketplaceDisplayData | null;
    workspaceId: string;
  }): Promise<void> {
    const existing = await this.appRegistrationRepository.findOne({
      where: {
        universalIdentifier: params.universalIdentifier,
        workspaceId: params.workspaceId,
      },
    });

    if (isDefined(existing)) {
      existing.name = params.name;
      existing.description = params.description;
      existing.author = params.author;
      existing.sourceType = params.sourceType;
      existing.sourcePackage = params.sourcePackage;
      existing.logoUrl = params.logoUrl;
      existing.websiteUrl = params.websiteUrl;
      existing.termsUrl = params.termsUrl;
      existing.latestAvailableVersion = params.latestAvailableVersion;
      existing.isFeatured = params.isFeatured;
      existing.marketplaceDisplayData = params.marketplaceDisplayData;

      await this.appRegistrationRepository.save(existing);

      return;
    }

    const registration = this.appRegistrationRepository.create({
      universalIdentifier: params.universalIdentifier,
      name: params.name,
      description: params.description,
      author: params.author,
      sourceType: params.sourceType,
      sourcePackage: params.sourcePackage,
      logoUrl: params.logoUrl,
      websiteUrl: params.websiteUrl,
      termsUrl: params.termsUrl,
      latestAvailableVersion: params.latestAvailableVersion,
      isFeatured: params.isFeatured,
      marketplaceDisplayData: params.marketplaceDisplayData,
      oAuthClientId: v4(),
      oAuthRedirectUris: [],
      oAuthScopes: [],
      workspaceId: params.workspaceId,
    });

    await this.appRegistrationRepository.save(registration);
  }
}
