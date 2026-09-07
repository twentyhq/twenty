import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildInstallApplicationJobId } from 'src/engine/core-modules/application/application-install/utils/build-install-application-job-id.util';
import {
  TriggerInstallApplicationJob,
  type TriggerInstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildJobStatus } from 'src/engine/core-modules/message-queue/utils/build-job-status.util';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';

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

    const jobIdPrefix = buildInstallApplicationJobId({
      workspaceId,
      universalIdentifier,
    });

    // The queue skips the add when an install for this prefix is already
    // waiting, in which case the waiting job is the one to report
    const jobId =
      (await this.workspaceQueueService.add<TriggerInstallApplicationJobData>(
        TriggerInstallApplicationJob.name,
        {
          applicationRegistrationId: registration.id,
          workspaceId,
        },
        {
          id: jobIdPrefix,
          broadcastTo: {
            workspaceId,
            userWorkspaceId,
          },
        },
      )) ?? (await this.findInFlightInstallJobId(jobIdPrefix));

    if (!isDefined(jobId)) {
      throw new ApplicationException(
        `Could not queue the installation of application ${universalIdentifier}`,
        ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
      );
    }

    return { jobId };
  }

  async findInstallApplicationJobStatus({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<JobStatusDTO | null> {
    const jobId = await this.findInFlightInstallJobId(
      buildInstallApplicationJobId({ workspaceId, universalIdentifier }),
    );

    if (!isDefined(jobId)) {
      return null;
    }

    const job = (await this.workspaceQueueService.getJobs([jobId]))[jobId];

    return isDefined(job) ? buildJobStatus({ jobId, job }) : null;
  }

  private async findInFlightInstallJobId(
    jobIdPrefix: string,
  ): Promise<string | undefined> {
    const inFlightJobs = await this.workspaceQueueService.getInFlightJobs();

    return inFlightJobs
      .map((job) => job.id)
      .filter(isDefined)
      .find((jobId) => getQueueJobIdPrefix(jobId) === jobIdPrefix);
  }
}
