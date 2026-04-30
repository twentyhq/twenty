import { type LogicFunctionManifest } from 'twenty-shared/application';
import { type InputJsonSchema } from 'twenty-shared/logic-function';

export type LogicFunctionHandler = (...args: any[]) => any | Promise<any>;

export type LogicFunctionConfig = Omit<
  LogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
  | 'toolInputSchema'
> & {
  handler: LogicFunctionHandler;
  toolInputSchema?: InputJsonSchema;
};
