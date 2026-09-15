import { isObject } from '@sniptt/guards';
import { type ServerRouteDispatchResult } from 'twenty-shared/application';
import { z } from 'zod';

import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';

const resolverDispatchResultSchema = z.object({
  workspaceId: z.uuid(),
  targetLogicFunctionUniversalIdentifier: z.uuid(),
  payload: z.custom<object>((value) => isObject(value)).optional(),
});

export const parseResolverDispatchResultOrThrow = (
  data: unknown,
): ServerRouteDispatchResult => {
  const parsedDispatchResult = resolverDispatchResultSchema.safeParse(data);

  if (!parsedDispatchResult.success) {
    throw new ServerRouteTriggerException(
      'Resolver logic function must return either a Response, or { workspaceId: string; targetLogicFunctionUniversalIdentifier: string; payload?: object }',
      ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    );
  }

  return parsedDispatchResult.data;
};
