import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import type { UninstallHandler } from '@/sdk/define/logic-functions/uninstall-payload-type';

export type PreUninstallLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
  | 'handler'
> & {
  handler: UninstallHandler;
};
