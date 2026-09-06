import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildInstallApplicationJobId } from 'src/engine/core-modules/application/application-install/utils/build-install-application-job-id.util';
import {
  TriggerInstallApplicationJob,
  type TriggerInstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { type JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildJobStatus } from 'src/engine/core-modules/message-queue/utils/build-job-status.util';
import { isTerminalJobState } from 'src/engine/core-modules/message-queue/utils/is-terminal-job-state.util';

@Injectable()
export class ApplicationInstallJobService {
  constructor(
    private readonly marketplaceQueryService: MarketplaceQueryService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  async triggerInstallApplicationJob({
    universalIdentifier,
    workspaceId,
    userWorkspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<{ jobId: string }> {
    const jobId = buildInstallApplicationJobId({
      workspaceId,
      universalIdentifier,
    });

    const runningJobStatus = await this.findJobStatus(jobId);

    if (
      isDefined(runningJobStatus) &&
      !isTerminalJobState(runningJobStatus.state)
    ) {
      return { jobId };
    }

    const registration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    if (isDefined(runningJobStatus)) {
      // A finished job keeps its id until retention evicts it, and BullMQ
      // silently drops a job whose id is already taken
      await this.workspaceQueueService.removeJob(jobId);
    }

    await this.workspaceQueueService.bulkAdd<TriggerInstallApplicationJobData>(
      TriggerInstallApplicationJob.name,
      [
        {
          data: {
            applicationRegistrationId: registration.id,
            workspaceId,
          },
          jobId,
        },
      ],
      {
        broadcastTo: {
          workspaceId,
          userWorkspaceId,
        },
      },
    );

    return { jobId };
  }

  async findInstallApplicationJobStatus({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<JobStatusDTO | null> {
    const jobStatus = await this.findJobStatus(
      buildInstallApplicationJobId({ workspaceId, universalIdentifier }),
    );

    return jobStatus ?? null;
  }

  private async findJobStatus(
    jobId: string,
  ): Promise<JobStatusDTO | undefined> {
    const job = (await this.workspaceQueueService.getJobs([jobId]))[jobId];

    if (!isDefined(job)) {
      return undefined;
    }

    return buildJobStatus({ jobId, job });
  }
}
