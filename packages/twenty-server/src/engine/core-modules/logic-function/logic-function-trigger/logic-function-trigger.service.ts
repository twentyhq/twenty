import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import {
  RouteTriggerResponse,
  buildRouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export type LogicFunctionTriggerOutcome =
  | { kind: 'response'; response: RouteTriggerResponse }
  | { kind: 'userError'; errorMessage: string };

@Injectable()
export class LogicFunctionTriggerService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async run({
    logicFunction,
    request,
    pathParameters,
    forwardedRequestHeaders,
    forwardAllHeaders = false,
    userId,
    userWorkspaceId,
    triggeredBy,
  }: {
    logicFunction: LogicFunctionEntity;
    request: Request;
    pathParameters: Record<string, string | string[] | undefined>;
    forwardedRequestHeaders: string[];
    forwardAllHeaders?: boolean;
    userId?: string | null;
    userWorkspaceId?: string | null;
    triggeredBy?: ApplicationTriggeredBy;
  }): Promise<LogicFunctionTriggerOutcome> {
    const event = buildLogicFunctionEvent({
      request,
      pathParameters,
      forwardedRequestHeaders,
      forwardAllHeaders,
      userWorkspaceId: userWorkspaceId ?? null,
    });

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: logicFunction.id,
      workspaceId: logicFunction.workspaceId,
      payload: event,
      ...(isDefined(userId) ? { userId } : {}),
      ...(isDefined(userWorkspaceId) ? { userWorkspaceId } : {}),
      ...(isDefined(triggeredBy) ? { triggeredBy } : {}),
    });

    if (!isDefined(result)) {
      return { kind: 'response', response: buildRouteTriggerResponse(result) };
    }

    if (result.error) {
      return { kind: 'userError', errorMessage: result.error.errorMessage };
    }

    return {
      kind: 'response',
      response: buildRouteTriggerResponse(result.data),
    };
  }
}
