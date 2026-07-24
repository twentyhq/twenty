import {
  type LogicFunctionManifest,
  type ServerRouteTriggerSettings,
} from 'twenty-shared/application';
import { type LogicFunctionHttpResponse } from 'twenty-shared/types';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

// A resolver function attached to `serverRouteTriggerSettings` runs in the
// owner workspace and returns either a sync `Response`, or BOTH the target
// workspace and the target logic function to enqueue. The dispatch contract is
// `{ workspaceId: string; targetLogicFunctionUniversalIdentifier: string;
// payload?: object }`. The resolver is the single point of authorization —
// the URL only carries the resolver's universalIdentifier.
export type ServerRouteDispatchResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload?: object;
};

// Returning a `Response` instead answers the caller synchronously and skips the
// dispatch, for providers whose webhook URL requires a handshake reply.
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
