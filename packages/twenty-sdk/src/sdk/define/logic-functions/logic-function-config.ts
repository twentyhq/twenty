import {
  type LogicFunctionManifest,
  type ServerRouteTriggerSettings,
} from 'twenty-shared/application';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

// A resolver function attached to `serverRouteTriggerSettings` runs in the
// owner workspace and must return BOTH the target workspace and the target
// logic function to dispatch to. The server contract is
// `{ workspaceId: string; targetLogicFunctionUniversalIdentifier: string;
// payload?: object; dispatchMode?: 'sync' | 'queued' }`. The resolver is the
// single point of authorization — the URL only carries the resolver's
// universalIdentifier.
//
// dispatchMode 'queued' acknowledges the caller with a 202 as soon as the
// resolver returns and runs the target on the worker queue (with internal
// retries on failure). Use it for webhook ingestion so the external sender
// never observes target latency or failures; the response body cannot carry
// target output. Defaults to 'sync'.
export type ServerRouteResolverResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload?: object;
  dispatchMode?: 'sync' | 'queued';
};

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
