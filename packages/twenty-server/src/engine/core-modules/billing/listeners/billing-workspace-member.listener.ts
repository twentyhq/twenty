import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import {
  UpdateSubscriptionJob,
  UpdateSubscriptionJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class BillingWorkspaceMemberListener {
  constructor(
    @Inject(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @OnEvent('workspaceMember.created')
  @OnEvent('workspaceMember.deleted')
  async handleCreateOrDeleteEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberObjectMetadata>,
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
