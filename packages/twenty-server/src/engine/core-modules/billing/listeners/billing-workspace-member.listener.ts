import { Injectable } from '@nestjs/common';

import {
  UpdateSubscriptionJob,
  UpdateSubscriptionJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { OnDatabaseEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class BillingWorkspaceMemberListener {
  constructor(
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @OnDatabaseEvent('workspaceMember', DatabaseEventAction.CREATED)
  @OnDatabaseEvent('workspaceMember', DatabaseEventAction.DELETED)
  async handleCreateOrDeleteEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return;
    }

    await this.messageQueueService.add<UpdateSubscriptionJobData>(
      UpdateSubscriptionJob.name,
      { workspaceId: payload.workspaceId },
    );
  }
}
