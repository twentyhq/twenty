import { Injectable } from '@nestjs/common';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  NavigationMenuItemDeletionJob,
  type NavigationMenuItemDeletionJobData,
} from 'src/engine/metadata-modules/navigation-menu-item/jobs/navigation-menu-item-deletion.job';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class NavigationMenuItemDeletionListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent>,
  ) {
    const deletedRecordIds = payload.events.map(({ recordId }) => recordId);

    if (deletedRecordIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<NavigationMenuItemDeletionJobData>(
      NavigationMenuItemDeletionJob.name,
      {
        workspaceId: payload.workspaceId,
        deletedRecordIds,
      },
    );
  }
}
