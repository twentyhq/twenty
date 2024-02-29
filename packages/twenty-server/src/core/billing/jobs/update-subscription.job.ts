import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { BillingService } from 'src/core/billing/billing.service';
import { UserWorkspaceService } from 'src/core/user-workspace/user-workspace.service';
export type UpdateSubscriptionJobData = { workspaceId: string };
@Injectable()
export class UpdateSubscriptionJob
  implements MessageQueueJob<UpdateSubscriptionJobData>
{
  protected readonly logger = new Logger(UpdateSubscriptionJob.name);
  constructor(
    private readonly billingService: BillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async handle(data: UpdateSubscriptionJobData): Promise<void> {
    const workspaceMembersCount =
      await this.userWorkspaceService.getWorkspaceMemberCount(data.workspaceId);

    if (workspaceMembersCount > 0) {
      await this.billingService.updateBillingSubscriptionQuantity(
        data.workspaceId,
        workspaceMembersCount,
      );
      this.logger.log(
        `Updating workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members`,
      );
    }
  }
}
