import { Injectable, Logger } from '@nestjs/common';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import {
  type ApplicationRegistrationCatalogCard,
  ApplicationRegistrationService,
} from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
@CoreEntityCache('marketplaceCatalog')
export class MarketplaceCatalogCacheProviderService extends CoreEntityCacheProvider<
  Record<string, MarketplaceAppDTO>
> {
  private readonly logger = new Logger(
    MarketplaceCatalogCacheProviderService.name,
  );
  private hasSyncBeenEnqueued = false;

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async computeForCache(): Promise<Record<string, MarketplaceAppDTO>> {
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

      return {};
    }

    const configuredStatuses =
      await this.applicationRegistrationVariableService.isConfiguredBatch(
        registrations.map((registration) => registration.id),
      );

    return registrations
      .filter((registration) => configuredStatuses.get(registration.id) ?? true)
      .reduce<Record<string, MarketplaceAppDTO>>(
        (accumulator, registration) => {
          accumulator[registration.universalIdentifier] =
            this.toMarketplaceAppDTO(registration);

          return accumulator;
        },
        {},
      );
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
}
