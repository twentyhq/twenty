import {
  type LogicFunctionManifest,
  type LogicFunctionTriggerManifest,
} from 'twenty-shared/application';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

export type LogicFunctionConfig = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
> & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  handler: LogicFunctionHandler;
  triggers?: LogicFunctionTriggerManifest[];
};
