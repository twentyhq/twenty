import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import {
  UpdateSubscriptionJob,
  UpdateSubscriptionJobData,
} from 'src/engine/core-modules/billing/jobs/update-subscription.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { BillingWorkspaceService } from 'src/engine/core-modules/billing/billing.workspace-service';

@Injectable()
export class BillingWorkspaceMemberListener {
  constructor(
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingWorkspaceService: BillingWorkspaceService,
  ) {}

  @OnEvent('workspaceMember.created')
  @OnEvent('workspaceMember.deleted')
  async handleCreateOrDeleteEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    const isBillingEnabledForWorkspace =
      await this.billingWorkspaceService.isBillingEnabledForWorkspace(
        payload.workspaceId,
      );

    if (!isBillingEnabledForWorkspace) {
      return;
    }

    await this.messageQueueService.add<UpdateSubscriptionJobData>(
      UpdateSubscriptionJob.name,
      { workspaceId: payload.workspaceId },
    );
  }
}
