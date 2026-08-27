/* @license Enterprise */

import { Logger, Scope } from '@nestjs/common';

import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
export type UpdateSubscriptionQuantityJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionQuantityJob {
  protected readonly logger = new Logger(UpdateSubscriptionQuantityJob.name);

  constructor(
    private readonly billingSubscriptionUpdateService: BillingSubscriptionUpdateService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Process(UpdateSubscriptionQuantityJob.name)
  async handle(data: UpdateSubscriptionQuantityJobData): Promise<void> {
    const authContext = buildSystemAuthContext(data.workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMemberRepository =
        this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      const workspaceMembersCount = await workspaceMemberRepository.count();

      if (!workspaceMembersCount || workspaceMembersCount <= 0) {
        return;
      }

      try {
        await this.billingSubscriptionUpdateService.changeSeats(
          data.workspaceId,
          workspaceMembersCount,
        );

        this.logger.log(
          `Updating workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members`,
        );
      } catch (e) {
        this.logger.warn(
          `Failed to update workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members. Error: ${e}`,
        );
      }
    }, authContext);
  }
}
