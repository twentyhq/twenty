import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
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
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    if (this.cachedApps !== null && Date.now() < this.cacheExpiresAt) {
      return this.cachedApps;
    }

    const registrations =
      await this.applicationRegistrationService.findManyListed();

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

  async findOneMarketplaceApp(
    universalIdentifier: string,
  ): Promise<MarketplaceAppDTO> {
    const registration =
      await this.findRegistrationByUniversalIdentifier(universalIdentifier);

    return this.toMarketplaceAppDTO(registration);
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
      isFeatured: registration.isFeatured,
    };
  }
}
