import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import type { UninstallHandler } from '@/sdk/define/logic-functions/uninstall-payload-type';

export type UninstallLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
  | 'serverRouteTriggerSettings'
  | 'serverCronTriggerSettings'
  | 'handler'
> & {
  handler: UninstallHandler;
};
