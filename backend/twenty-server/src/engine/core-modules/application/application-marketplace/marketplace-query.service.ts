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
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
export class MarketplaceQueryService {
  private readonly logger = new Logger(MarketplaceQueryService.name);
  private hasSyncBeenEnqueued = false;

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findManyMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
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
          { id: 'marketplace-catalog-sync' }, // Avoids triggering multiple pending jobs
        );
      }

      return [];
    }

    return registrations.map((registration) =>
      this.toMarketplaceAppDTO(registration),
    );
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
    registration: ApplicationRegistrationEntity,
  ): MarketplaceAppDTO {
    const app = registration.manifest?.application;

    return {
      id: registration.universalIdentifier,
      name: app?.displayName ?? registration.name,
      description: app?.description ?? '',
      icon: app?.icon ?? 'IconApps',
      author: app?.author ?? 'Unknown',
      category: app?.category ?? '',
      logo: app?.logoUrl ?? undefined,
      sourcePackage: registration.sourcePackage ?? undefined,
      isFeatured: registration.isFeatured,
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
      manifest: registration.manifest ?? undefined,
    };
  }
}
