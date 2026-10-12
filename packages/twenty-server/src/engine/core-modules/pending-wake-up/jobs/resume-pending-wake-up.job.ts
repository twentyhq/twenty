import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';
import { PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { type ResumePendingWakeUpJobData } from 'src/engine/core-modules/pending-wake-up/types/resume-pending-wake-up-job-data.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Processor({
  queueName: MessageQueue.delayedJobsQueue,
  scope: Scope.REQUEST,
})
export class ResumePendingWakeUpJob {
  constructor(
    private readonly pendingWakeUpResolverService: PendingWakeUpResolverService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Process(RESUME_PENDING_WAKE_UP_JOB_NAME)
  async handle(jobData: ResumePendingWakeUpJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.pendingWakeUpResolverService.resolve(jobData),
      buildSystemAuthContext(jobData.workspaceId),
    );
  }
}
