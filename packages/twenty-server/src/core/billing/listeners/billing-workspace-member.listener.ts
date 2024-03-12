import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { ObjectRecordCreateEvent } from 'src/integrations/event-emitter/types/object-record-create.event';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';
import {
  UpdateSubscriptionJob,
  UpdateSubscriptionJobData,
} from 'src/core/billing/jobs/update-subscription.job';

@Injectable()
export class BillingWorkspaceMemberListener {
  constructor(
    @Inject(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workspaceMember.created')
  @OnEvent('workspaceMember.deleted')
  async handleCreateOrDeleteEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberObjectMetadata>,
  ) {
    await this.messageQueueService.add<UpdateSubscriptionJobData>(
      UpdateSubscriptionJob.name,
      { workspaceId: payload.workspaceId },
    );
  }
}
