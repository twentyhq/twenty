import {
  type LogicFunctionManifest,
  type LogicFunctionTriggerManifest,
} from 'twenty-shared/application';

export type FunctionHandler = (...args: any[]) => any | Promise<any>;

export type FunctionConfig = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
> & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  handler: FunctionHandler;
  triggers?: LogicFunctionTriggerManifest[];
};
