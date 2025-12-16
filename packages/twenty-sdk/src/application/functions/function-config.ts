import {
  type ServerlessFunctionManifest,
  type ServerlessFunctionTriggerManifest,
} from 'twenty-shared/application';

export type FunctionConfig = Omit<
  ServerlessFunctionManifest,
  'handlerPath' | 'handlerName'
> & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers?: ServerlessFunctionTriggerManifest[];
};
