import { Injectable } from '@nestjs/common';

import { type EnqueueJobResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ENQUEUE_JOB_DEFAULT_RETRY_LIMIT,
  ENQUEUE_JOB_PRIORITY,
} from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';
import { type EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
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
    const { logicFunctionUniversalIdentifier } = input;

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

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

    await this.messageQueueService.add<LogicFunctionTriggerJobData>(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: flatLogicFunction.id,
        workspaceId,
        payload: input.payload ?? {},
        ...(isDefined(userId) ? { userId } : {}),
        ...(isDefined(userWorkspaceId) ? { userWorkspaceId } : {}),
      },
      {
        retryLimit: input.retryLimit ?? ENQUEUE_JOB_DEFAULT_RETRY_LIMIT,
        priority: ENQUEUE_JOB_PRIORITY,
        ...(isDefined(input.delayMs) ? { delay: input.delayMs } : {}),
      },
    );

    return { enqueued: true, logicFunctionUniversalIdentifier };
  }
}
