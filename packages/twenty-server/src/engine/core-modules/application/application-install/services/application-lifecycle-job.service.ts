import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type ApplicationLifecycleOperation,
  buildApplicationLifecycleJobId,
} from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-job-id.util';
import {
  TriggerInstallApplicationJob,
  type TriggerInstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import {
  TriggerUninstallApplicationJob,
  type TriggerUninstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-uninstall-application.job';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildJobStatus } from 'src/engine/core-modules/message-queue/utils/build-job-status.util';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';

type LifecycleJobTarget = {
  universalIdentifier: string;
  workspaceId: string;
};

@Injectable()
export class ApplicationLifecycleJobService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly marketplaceQueryService: MarketplaceQueryService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  async triggerInstallApplicationJob({
    universalIdentifier,
    workspaceId,
    userWorkspaceId,
  }: LifecycleJobTarget & { userWorkspaceId: string }): Promise<{
    jobId: string;
  }> {
    const registration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    return this.triggerLifecycleJob<TriggerInstallApplicationJobData>({
      operation: 'install',
      jobName: TriggerInstallApplicationJob.name,
      data: { applicationRegistrationId: registration.id, workspaceId },
      universalIdentifier,
      workspaceId,
      userWorkspaceId,
    });
  }

  async triggerUninstallApplicationJob({
    universalIdentifier,
    workspaceId,
    userWorkspaceId,
  }: LifecycleJobTarget & { userWorkspaceId: string }): Promise<{
    jobId: string;
  }> {
    await this.applicationService.findOneApplicationOrThrow({
      universalIdentifier,
      workspaceId,
    });

    return this.triggerLifecycleJob<TriggerUninstallApplicationJobData>({
      operation: 'uninstall',
      jobName: TriggerUninstallApplicationJob.name,
      data: { universalIdentifier, workspaceId },
      universalIdentifier,
      workspaceId,
      userWorkspaceId,
    });
  }

  findInstallApplicationJobStatus(
    target: LifecycleJobTarget,
  ): Promise<JobStatusDTO | null> {
    return this.findLifecycleJobStatus({ operation: 'install', ...target });
  }

  findUninstallApplicationJobStatus(
    target: LifecycleJobTarget,
  ): Promise<JobStatusDTO | null> {
    return this.findLifecycleJobStatus({ operation: 'uninstall', ...target });
  }

  private async triggerLifecycleJob<TData extends MessageQueueJobData>({
    operation,
    jobName,
    data,
    universalIdentifier,
    workspaceId,
    userWorkspaceId,
  }: LifecycleJobTarget & {
    operation: ApplicationLifecycleOperation;
    jobName: string;
    data: TData;
    userWorkspaceId: string;
  }): Promise<{ jobId: string }> {
    const jobIdPrefix = buildApplicationLifecycleJobId({
      operation,
      workspaceId,
      universalIdentifier,
    });

    // The queue skips the add when a job for this prefix is already waiting,
    // in which case the waiting job is the one to report
    const jobId =
      (await this.workspaceQueueService.add<TData>(jobName, data, {
        id: jobIdPrefix,
        broadcastTo: { workspaceId, userWorkspaceId },
      })) ?? (await this.findInFlightJobId(jobIdPrefix));

    if (!isDefined(jobId)) {
      throw new ApplicationException(
        `Could not queue the ${operation} of application ${universalIdentifier}`,
        ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
      );
    }

    return { jobId };
  }

  private async findLifecycleJobStatus({
    operation,
    universalIdentifier,
    workspaceId,
  }: LifecycleJobTarget & {
    operation: ApplicationLifecycleOperation;
  }): Promise<JobStatusDTO | null> {
    const jobId = await this.findInFlightJobId(
      buildApplicationLifecycleJobId({
        operation,
        workspaceId,
        universalIdentifier,
      }),
    );

    if (!isDefined(jobId)) {
      return null;
    }

    const job = (await this.workspaceQueueService.getJobs([jobId]))[jobId];

    return isDefined(job) ? buildJobStatus({ jobId, job }) : null;
  }

  private async findInFlightJobId(
    jobIdPrefix: string,
  ): Promise<string | undefined> {
    const inFlightJobs = await this.workspaceQueueService.getInFlightJobs();

    return inFlightJobs
      .map((job) => job.id)
      .filter(isDefined)
      .find((jobId) => getQueueJobIdPrefix(jobId) === jobIdPrefix);
  }
}
