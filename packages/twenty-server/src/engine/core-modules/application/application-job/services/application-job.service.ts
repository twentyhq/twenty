import { Injectable } from '@nestjs/common';

import {
  type EnqueueJobResult,
  type EnqueueJobsResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ENQUEUE_JOB_DEFAULT_RETRY_LIMIT,
  ENQUEUE_JOB_PRIORITY,
} from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';
import { type EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';
import { type EnqueueJobsInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-jobs.input';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationJobService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueJob({
    applicationId,
    workspaceId,
    userId,
    userWorkspaceId,
    input,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string | null;
    userWorkspaceId: string | null;
    input: EnqueueJobInputDTO;
  }): Promise<EnqueueJobResult> {
    const { jobs } = await this.enqueueJobs({
      applicationId,
      workspaceId,
      userId,
      userWorkspaceId,
      input: { jobs: [input] },
    });

    return jobs[0];
  }

  async enqueueJobs({
    applicationId,
    workspaceId,
    userId,
    userWorkspaceId,
    input,
  }: {
    applicationId: string;
    workspaceId: string;
    userId: string | null;
    userWorkspaceId: string | null;
    input: EnqueueJobsInputDTO;
  }): Promise<EnqueueJobsResult> {
    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    // Resolve every job before enqueuing any, so an invalid job in the batch
    // does not leave a partially enqueued batch behind.
    const jobsToEnqueue = input.jobs.map((job) => {
      const { logicFunctionUniversalIdentifier } = job;

      const flatLogicFunction = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatLogicFunctionMaps,
        universalIdentifier: logicFunctionUniversalIdentifier,
      });

      if (
        !isDefined(flatLogicFunction) ||
        isDefined(flatLogicFunction.deletedAt) ||
        flatLogicFunction.applicationId !== applicationId
      ) {
        throw new ApplicationException(
          `Logic function ${logicFunctionUniversalIdentifier} not found in this application`,
          ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }

      return { job, logicFunctionId: flatLogicFunction.id };
    });

    for (const { job, logicFunctionId } of jobsToEnqueue) {
      await this.messageQueueService.add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId,
          workspaceId,
          payload: job.payload ?? {},
          ...(isDefined(userId) ? { userId } : {}),
          ...(isDefined(userWorkspaceId) ? { userWorkspaceId } : {}),
        },
        {
          retryLimit: job.retryLimit ?? ENQUEUE_JOB_DEFAULT_RETRY_LIMIT,
          backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
          priority: ENQUEUE_JOB_PRIORITY,
          ...(isDefined(job.delayMs) ? { delay: job.delayMs } : {}),
        },
      );
    }

    return {
      jobs: jobsToEnqueue.map(({ job }) => ({
        enqueued: true,
        logicFunctionUniversalIdentifier: job.logicFunctionUniversalIdentifier,
      })),
    };
  }
}
