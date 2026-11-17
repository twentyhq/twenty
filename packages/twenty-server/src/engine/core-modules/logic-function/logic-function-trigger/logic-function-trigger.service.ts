import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import {
  RouteTriggerResponse,
  buildRouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type LogicFunctionTriggerOutcome =
  | { kind: 'response'; response: RouteTriggerResponse }
  | { kind: 'userError'; errorMessage: string };

@Injectable()
export class LogicFunctionTriggerService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async run({
    logicFunction,
    request,
    pathParameters,
    forwardedRequestHeaders,
    forwardAllHeaders = false,
    userId,
    userWorkspaceId,
  }: {
    logicFunction: LogicFunctionEntity;
    request: Request;
    pathParameters: Record<string, string | string[] | undefined>;
    forwardedRequestHeaders: string[];
    forwardAllHeaders?: boolean;
    userId?: string | null;
    userWorkspaceId?: string | null;
  }): Promise<LogicFunctionTriggerOutcome> {
    const event = buildLogicFunctionEvent({
      request,
      pathParameters,
      forwardedRequestHeaders,
      forwardAllHeaders,
      identityAssertionHeaderName: this.twentyConfigService.get(
        'SERVER_ADMIN_IDENTITY_ASSERTION_HEADER',
      ),
      userWorkspaceId: userWorkspaceId ?? null,
    });

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: logicFunction.id,
      workspaceId: logicFunction.workspaceId,
      payload: event,
      ...(isDefined(userId) ? { userId } : {}),
      ...(isDefined(userWorkspaceId) ? { userWorkspaceId } : {}),
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
