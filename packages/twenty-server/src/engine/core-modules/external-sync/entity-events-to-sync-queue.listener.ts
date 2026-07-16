import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

/**
 * Listens for CREATED events on externalSyncInboundEvent and enqueues
 * them to externalSyncQueue for processing by the inbound sync consumer.
 *
 * Follows the EntityEventsToDbListener pattern.
 * Fires post-commit (receipt is already persisted), ensuring at-least-once delivery.
 */
@Injectable()
export class EntityEventsToSyncQueueListener {
  constructor(
    @InjectMessageQueue(MessageQueue.externalSyncQueue)
    private readonly externalSyncQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent(
    'externalSyncInboundEvent',
    DatabaseEventAction.CREATED,
  )
  async handleInboundEventCreated(
    batchEvent: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ): Promise<void> {
    for (const event of batchEvent.events) {
      await this.externalSyncQueueService.add(
        'process-inbound-event',
        {
          recordId: event.recordId,
          workspaceId: batchEvent.workspaceId,
        },
        { retryLimit: 3 },
      );
    }
  }
}
