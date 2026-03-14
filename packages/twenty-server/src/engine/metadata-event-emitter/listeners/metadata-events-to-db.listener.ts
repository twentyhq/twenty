import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AllMetadataName } from 'twenty-shared/metadata';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetadataEventBatch } from 'src/engine/metadata-event-emitter/types/metadata-event-batch.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { WorkspaceEventEmitterService } from 'src/engine/workspace-event-emitter/workspace-event-emitter.service';
import { type AllMetadataEventType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

@Injectable()
export class MetadataEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    private readonly workspaceEventEmitterService: WorkspaceEventEmitterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @OnEvent('metadata.*.created')
  async handleCreate(
    metadataEventBatch: MetadataEventBatch<AllMetadataName, 'created'>,
  ): Promise<void> {
    return this.handleEvent(metadataEventBatch);
  }

  @OnEvent('metadata.*.updated')
  async handleUpdate(
    metadataEventBatch: MetadataEventBatch<AllMetadataName, 'updated'>,
  ): Promise<void> {
    return this.handleEvent(metadataEventBatch);
  }

  @OnEvent('metadata.*.deleted')
  async handleDelete(
    metadataEventBatch: MetadataEventBatch<AllMetadataName, 'deleted'>,
  ): Promise<void> {
    return this.handleEvent(metadataEventBatch);
  }

  private async handleEvent(
    metadataEventBatch: MetadataEventBatch<
      AllMetadataName,
      AllMetadataEventType
    >,
  ): Promise<void> {
    await this.webhookQueueService.add<
      MetadataEventBatch<AllMetadataName, AllMetadataEventType>
    >(CallWebhookJobsForMetadataJob.name, metadataEventBatch, {
      retryLimit: 3,
    });

    if (metadataEventBatch.events.length > 0) {
      const cacheKeyName = getMetadataFlatEntityMapsKey(
        metadataEventBatch.metadataName,
      ) as WorkspaceCacheKeyName;

      const cacheHashes = await this.workspaceCacheService.getCacheHashes(
        metadataEventBatch.workspaceId,
        [cacheKeyName],
      );

      const updatedCollectionHash = cacheHashes[cacheKeyName];

      await this.workspaceEventEmitterService.publish({
        ...metadataEventBatch,
        updatedCollectionHash,
      });
    }
  }
}
