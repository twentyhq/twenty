import {
  type LogicFunctionManifest,
  type ServerRouteDispatchResult,
  type ServerRouteTriggerSettings,
} from 'twenty-shared/application';
import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';
import { type LogicFunctionHttpResponse } from 'twenty-shared/types';

// TPayload defaults to any so handlers declaring a concrete payload type stay assignable
export type LogicFunctionHandler<TPayload = any> = (
  payload: TPayload,
  context: LogicFunctionExecutionContext,
) => any | Promise<any>;

// The resolver runs in the owner workspace and is the only authorization point: the URL carries just its universalIdentifier.
// A dispatch result enqueues the target; a Response answers synchronously, for providers needing a handshake reply.
export type ServerRouteResolverResult =
  | ServerRouteDispatchResult
  | LogicFunctionHttpResponse;

export type ServerRouteResolverHandler<TPayload = any> = (
  payload: TPayload,
  context: LogicFunctionExecutionContext,
) => ServerRouteResolverResult | Promise<ServerRouteResolverResult>;

type LogicFunctionConfigBase = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
  | 'serverRouteTriggerSettings'
>;

export type LogicFunctionConfig = LogicFunctionConfigBase &
  (
    | {
        serverRouteTriggerSettings?: undefined;
        handler: LogicFunctionHandler;
      }
    | {
        serverRouteTriggerSettings: ServerRouteTriggerSettings;
        handler: ServerRouteResolverHandler;
      }
  );
