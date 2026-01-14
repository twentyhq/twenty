import {
  type ServerlessFunctionManifest,
  type ServerlessFunctionTriggerManifest,
} from 'twenty-shared/application';

export type FunctionHandler = (...args: any[]) => any | Promise<any>;

export type FunctionConfig = Omit<
  ServerlessFunctionManifest,
  'handlerPath' | 'handlerName'
> & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  handler: FunctionHandler;
  triggers?: ServerlessFunctionTriggerManifest[];
};
