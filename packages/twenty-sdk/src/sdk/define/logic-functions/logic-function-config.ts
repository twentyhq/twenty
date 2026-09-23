import {
  type LogicFunctionManifest,
  type ServerCronCursor,
  type ServerCronDispatchResult,
  type ServerCronPayload,
  type ServerCronTriggerSettings,
  type ServerRouteDispatchResult,
  type ServerRouteTriggerSettings,
} from 'twenty-shared/application';
import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';
import { type LogicFunctionHttpResponse } from 'twenty-shared/types';

// TPayload defaults to any so handlers that declare a concrete payload type
// stay assignable; the second parameter is what authors need to discover.
export type LogicFunctionHandler<TPayload = any> = (
  payload: TPayload,
  context: LogicFunctionExecutionContext,
) => any | Promise<any>;

// A resolver attached to `serverRouteTriggerSettings` runs in the owner workspace and is the single
// point of authorization: the URL only carries the resolver's universalIdentifier. Returning a
// dispatch result enqueues the target, returning a `Response` answers the caller synchronously
// instead, for providers whose webhook URL requires a handshake reply.
export type ServerRouteResolverResult =
  | ServerRouteDispatchResult
  | LogicFunctionHttpResponse;

export type ServerRouteResolverHandler<TPayload = any> = (
  payload: TPayload,
  context: LogicFunctionExecutionContext,
) => ServerRouteResolverResult | Promise<ServerRouteResolverResult>;

export type ServerCronHandler<TCursor extends ServerCronCursor = any> = (
  payload: ServerCronPayload<TCursor>,
  context: LogicFunctionExecutionContext,
) =>
  | ServerCronDispatchResult<TCursor>
  | Promise<ServerCronDispatchResult<TCursor>>;

type LogicFunctionConfigBase = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
  | 'serverRouteTriggerSettings'
  | 'serverCronTriggerSettings'
>;

type ServerCronLogicFunctionConfig = Omit<
  LogicFunctionConfigBase,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
> & {
  cronTriggerSettings?: undefined;
  databaseEventTriggerSettings?: undefined;
  httpRouteTriggerSettings?: undefined;
  toolTriggerSettings?: undefined;
  workflowActionTriggerSettings?: undefined;
  serverRouteTriggerSettings?: undefined;
  serverCronTriggerSettings: ServerCronTriggerSettings;
  handler: ServerCronHandler;
};

export type LogicFunctionConfig =
  | (LogicFunctionConfigBase &
      (
        | {
            serverRouteTriggerSettings?: undefined;
            serverCronTriggerSettings?: undefined;
            handler: LogicFunctionHandler;
          }
        | {
            serverRouteTriggerSettings: ServerRouteTriggerSettings;
            serverCronTriggerSettings?: undefined;
            handler: ServerRouteResolverHandler;
          }
      ))
  | ServerCronLogicFunctionConfig;
