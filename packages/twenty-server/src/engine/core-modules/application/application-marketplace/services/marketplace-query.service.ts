import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { assertValidNpmPackageName } from 'src/engine/core-modules/application/utils/assert-valid-npm-package-name.util';
import { AppRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/app-registration-source-type.enum';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const MARKETPLACE_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class MarketplaceQueryService {
  private readonly logger = new Logger(MarketplaceQueryService.name);
  private cachedApps: MarketplaceAppDTO[] | null = null;
  private cacheExpiresAt = 0;
  private hasSyncBeenEnqueued = false;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    if (this.cachedApps !== null && Date.now() < this.cacheExpiresAt) {
      return this.cachedApps;
    }

    const registrations = await this.appRegistrationRepository.find({
      where: { sourceType: AppRegistrationSourceType.NPM },
    });

    if (registrations.length === 0) {
      if (!this.hasSyncBeenEnqueued) {
        this.hasSyncBeenEnqueued = true;
        this.logger.log(
          'No marketplace registrations found, enqueuing one-time sync job',
        );
        await this.messageQueueService.add(
          MarketplaceCatalogSyncCronJob.name,
          {},
        );
      }

      return [];
    }

    this.cachedApps = registrations.map((registration) =>
      this.toMarketplaceAppDTO(registration),
    );
    this.cacheExpiresAt = Date.now() + MARKETPLACE_CACHE_TTL_MS;

    return this.cachedApps;
  }

  async findRegistrationByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration = await this.appRegistrationRepository.findOne({
      where: { universalIdentifier },
    });

    if (!isDefined(registration)) {
      throw new ApplicationRegistrationException(
        `No application registration found for identifier "${universalIdentifier}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async findOrCreateNpmRegistration(params: {
    packageName: string;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    assertValidNpmPackageName(params.packageName);

    const existing = await this.appRegistrationRepository.findOne({
      where: { sourcePackage: params.packageName },
    });

    if (isDefined(existing)) {
      return existing;
    }

    this.logger.log(
      `Creating new registration for npm package "${params.packageName}"`,
    );

    try {
      const registration = this.appRegistrationRepository.create({
        universalIdentifier: v4(),
        name: params.packageName,
        sourceType: AppRegistrationSourceType.NPM,
        sourcePackage: params.packageName,
        oAuthClientId: v4(),
        oAuthRedirectUris: [],
        oAuthScopes: [],
        ownerWorkspaceId: params.ownerWorkspaceId,
      });

      return await this.appRegistrationRepository.save(registration);
    } catch {
      const concurrentlyCreated = await this.appRegistrationRepository.findOne({
        where: { sourcePackage: params.packageName },
      });

      if (isDefined(concurrentlyCreated)) {
        return concurrentlyCreated;
      }

      throw new ApplicationRegistrationException(
        `Failed to create registration for package "${params.packageName}"`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }
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
}
