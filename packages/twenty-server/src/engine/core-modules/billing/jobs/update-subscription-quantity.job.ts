/* @license Enterprise */

import { Logger, Scope } from '@nestjs/common';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
export type UpdateSubscriptionQuantityJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionQuantityJob {
  protected readonly logger = new Logger(UpdateSubscriptionQuantityJob.name);

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(UpdateSubscriptionQuantityJob.name)
  async handle(data: UpdateSubscriptionQuantityJobData): Promise<void> {
    const authContext = buildSystemAuthContext(data.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            data.workspaceId,
            'workspaceMember',
          );

        const workspaceMembersCount = await workspaceMemberRepository.count();

        if (!workspaceMembersCount || workspaceMembersCount <= 0) {
          return;
        }

        try {
          const billingBaseProductSubscriptionItem =
            await this.billingSubscriptionService.getBaseProductCurrentBillingSubscriptionItemOrThrow(
              data.workspaceId,
            );

          await this.stripeSubscriptionItemService.updateSubscriptionItem(
            billingBaseProductSubscriptionItem.stripeSubscriptionItemId,
            { quantity: workspaceMembersCount },
          );

          this.logger.log(
            `Updating workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members`,
          );
        } catch (e) {
          this.logger.warn(
            `Failed to update workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members. Error: ${e}`,
          );
        }
      },
    );
  }
}
