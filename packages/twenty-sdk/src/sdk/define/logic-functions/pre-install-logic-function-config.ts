import type { InstallHandler } from '@/sdk/define/logic-functions/install-payload-type';
import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';

export type PreInstallLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
  | 'handler'
> & {
  handler: InstallHandler;
  shouldRunOnVersionUpgrade?: boolean;
};
