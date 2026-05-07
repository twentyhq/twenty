import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EnqueueLogicFunctionExecutionDto } from 'src/engine/core-modules/logic-function/app-logic-function/dtos/enqueue-logic-function-execution.dto';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type EnqueueLogicFunctionExecutionResult = {
  jobId: string;
  status: 'queued';
};

@Injectable()
export class AppLogicFunctionService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly logicFunctionMessageQueueService: MessageQueueService,
  ) {}

  async enqueueExecution(params: {
    workspaceId: string;
    applicationId: string;
    dto: EnqueueLogicFunctionExecutionDto;
  }): Promise<EnqueueLogicFunctionExecutionResult> {
    const { workspaceId, applicationId, dto } = params;
    const { name, universalIdentifier, payload } = dto;

    const hasUniversalIdentifier = isDefined(universalIdentifier);
    const hasName = isNonEmptyString(name);

    if (hasUniversalIdentifier === hasName) {
      throw new BadRequestException(
        'Provide exactly one of name or universalIdentifier',
      );
    }

    const logicFunction = await this.findLogicFunctionForApplicationOrThrow({
      workspaceId,
      applicationId,
      name: hasName ? name : undefined,
      universalIdentifier: hasUniversalIdentifier
        ? universalIdentifier
        : undefined,
    });

    const jobId = await this.logicFunctionMessageQueueService.add<
      LogicFunctionTriggerJobData[]
    >(
      LogicFunctionTriggerJob.name,
      [
        {
          logicFunctionId: logicFunction.id,
          workspaceId,
          payload,
        },
      ],
      { retryLimit: 3 },
    );

    if (!isDefined(jobId)) {
      throw new InternalServerErrorException(
        'Failed to enqueue logic function execution',
      );
    }

    return { jobId, status: 'queued' };
  }

  private async findLogicFunctionForApplicationOrThrow(params: {
    workspaceId: string;
    applicationId: string;
    name?: string;
    universalIdentifier?: string;
  }): Promise<FlatLogicFunction> {
    const { workspaceId, applicationId, name, universalIdentifier } = params;

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    if (isDefined(universalIdentifier)) {
      const logicFunction =
        flatLogicFunctionMaps.byUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(logicFunction) ||
        logicFunction.applicationId !== applicationId ||
        isDefined(logicFunction.deletedAt)
      ) {
        throw new NotFoundException('Logic function not found');
      }

      return logicFunction;
    }

    const matches = Object.values(flatLogicFunctionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (logicFunction) =>
          logicFunction.applicationId === applicationId &&
          !isDefined(logicFunction.deletedAt) &&
          logicFunction.name === name,
      );

    if (matches.length === 0) {
      throw new NotFoundException('Logic function not found');
    }

    if (matches.length > 1) {
      throw new ConflictException(
        'Multiple logic functions match this name; use universalIdentifier',
      );
    }

    return matches[0];
  }
}
