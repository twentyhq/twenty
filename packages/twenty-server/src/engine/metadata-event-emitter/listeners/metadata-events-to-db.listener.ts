import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AllMetadataName } from 'twenty-shared/metadata';
import {
  isDefined,
  isMetadataGqlOperationSignature,
} from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetadataEventBatch } from 'src/engine/metadata-event-emitter/types/metadata-event-batch.type';
import { CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type RecordOrMetadataGqlOperationSignature } from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { type AllMetadataEventType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

@Injectable()
export class MetadataEventsToDbListener {
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
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
      await this.publishToEventStreams(metadataEventBatch);
    }
  }

  private async publishToEventStreams(
    metadataEventBatch: MetadataEventBatch<
      AllMetadataName,
      AllMetadataEventType
    >,
  ): Promise<void> {
    const workspaceId = metadataEventBatch.workspaceId;

    const activeStreamIds =
      await this.eventStreamService.getActiveStreamIds(workspaceId);

    if (activeStreamIds.length === 0) {
      return;
    }

    const streamsData = await this.eventStreamService.getStreamsData(
      workspaceId,
      activeStreamIds,
    );

    const streamIdsToRemove: string[] = [];

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        streamIdsToRemove.push(streamChannelId);
        continue;
      }

      if (Object.keys(streamData.queries).length === 0) {
        continue;
      }

      const matchedQueryIds = this.getMatchingQueryIds(
        streamData.queries,
        metadataEventBatch.metadataName,
      );

      if (matchedQueryIds.length === 0) {
        continue;
      }

      const metadataEventsWithQueryIds = metadataEventBatch.events.map(
        (metadataEvent) => ({
          queryIds: matchedQueryIds,
          metadataEvent,
        }),
      );

      const payload: EventStreamPayload = {
        objectRecordEventsWithQueryIds: [],
        metadataEventsWithQueryIds,
      };

      await this.subscriptionService.publishToEventStream({
        workspaceId,
        eventStreamChannelId: streamChannelId,
        payload,
      });
    }

    await this.eventStreamService.removeFromActiveStreams(
      workspaceId,
      streamIdsToRemove,
    );
  }

  private getMatchingQueryIds(
    queries: Record<string, RecordOrMetadataGqlOperationSignature>,
    metadataName: string,
  ): string[] {
    return Object.entries(queries)
      .filter(
        ([, operationSignature]) =>
          isMetadataGqlOperationSignature(operationSignature) &&
          operationSignature.metadataName === metadataName,
      )
      .map(([queryId]) => queryId);
  }
}
