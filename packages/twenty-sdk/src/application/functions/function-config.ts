import {
  type ServerlessFunctionManifest,
  type ServerlessFunctionTriggerManifest,
} from 'twenty-shared/application';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
