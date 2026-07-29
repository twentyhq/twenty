import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type EnqueueJobResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ENQUEUE_JOB_DEFAULT_RETRY_LIMIT } from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';
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
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Injectable()
export class ApplicationJobService {
  constructor(
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
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

    // Scoping the lookup to the calling application is the authorization
    // boundary: an app can only enqueue its own logic functions.
    const logicFunction = await this.logicFunctionRepository.findOne({
      where: {
        universalIdentifier: logicFunctionUniversalIdentifier,
        workspaceId,
        applicationId,
      },
      select: { id: true },
    });

    if (!isDefined(logicFunction)) {
      throw new ApplicationException(
        `Logic function ${logicFunctionUniversalIdentifier} not found in this application`,
        ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    await this.messageQueueService.add<LogicFunctionTriggerJobData>(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: logicFunction.id,
        workspaceId,
        payload: input.payload ?? {},
        // The enqueued run inherits the caller's acting user so its app access
        // token carries the same permissions as the function that queued it.
        ...(isDefined(userId) ? { userId } : {}),
        ...(isDefined(userWorkspaceId) ? { userWorkspaceId } : {}),
      },
      {
        retryLimit: input.retryLimit ?? ENQUEUE_JOB_DEFAULT_RETRY_LIMIT,
        ...(isDefined(input.priority) ? { priority: input.priority } : {}),
        ...(isDefined(input.delayMs) ? { delay: input.delayMs } : {}),
      },
    );

    return { enqueued: true, logicFunctionUniversalIdentifier };
  }
}
