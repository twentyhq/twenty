import {
  type LogicFunctionManifest,
  type ServerRouteDispatchResult,
  type ServerRouteTriggerSettings,
} from 'twenty-shared/application';
import { type LogicFunctionHttpResponse } from 'twenty-shared/types';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

// A resolver attached to `serverRouteTriggerSettings` runs in the owner workspace and is the single
// point of authorization: the URL only carries the resolver's universalIdentifier. Returning a
// dispatch result enqueues the target, returning a `Response` answers the caller synchronously
// instead, for providers whose webhook URL requires a handshake reply.
export type ServerRouteResolverResult =
  | ServerRouteDispatchResult
  | LogicFunctionHttpResponse;

export type ServerRouteResolverHandler = (
  ...args: any[]
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
