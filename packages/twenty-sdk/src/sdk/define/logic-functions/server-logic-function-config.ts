import { type ServerLogicFunctionManifest } from 'twenty-shared/application';

import { type LogicFunctionHandler } from '@/sdk/define/logic-functions/logic-function-config';

export type ServerLogicFunctionConfig = Omit<
  ServerLogicFunctionManifest,
  | 'sourceHandlerPath'
  | 'builtHandlerPath'
  | 'builtHandlerChecksum'
  | 'handlerName'
> & {
  handler: LogicFunctionHandler;
};
