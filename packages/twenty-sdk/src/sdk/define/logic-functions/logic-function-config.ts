import {
  type LogicFunctionManifest,
  type ServerWebhookTriggerSettings,
} from 'twenty-shared/application';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

// A resolver function attached to `serverWebhookTriggerSettings` runs in the
// owner workspace and must return the target workspace to dispatch to. The
// server contract is `{ workspaceId: string; payload?: object }`.
export type ServerWebhookResolverResult = {
  workspaceId: string;
  payload?: object;
};

export type ServerWebhookResolverHandler = (
  ...args: any[]
) => ServerWebhookResolverResult | Promise<ServerWebhookResolverResult>;

type LogicFunctionConfigBase = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
  | 'serverWebhookTriggerSettings'
>;

export type LogicFunctionConfig = LogicFunctionConfigBase &
  (
    | {
        serverWebhookTriggerSettings?: undefined;
        handler: LogicFunctionHandler;
      }
    | {
        serverWebhookTriggerSettings: ServerWebhookTriggerSettings;
        handler: ServerWebhookResolverHandler;
      }
  );
