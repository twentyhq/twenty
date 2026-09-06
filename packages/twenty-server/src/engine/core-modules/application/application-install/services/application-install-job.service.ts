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
    const registration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    const jobId = buildInstallApplicationJobId({
      workspaceId,
      universalIdentifier,
    });

    // The queue ignores a job whose id it already holds, so the id is what
    // keeps a second trigger from installing the same application twice
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
    const jobId = buildInstallApplicationJobId({
      workspaceId,
      universalIdentifier,
    });

    const job = (await this.workspaceQueueService.getJobs([jobId]))[jobId];

    if (!isDefined(job)) {
      return null;
    }

    return buildJobStatus({ jobId, job });
  }
}
