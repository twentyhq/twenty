import type { InstallLogicFunctionHandler, LogicFunctionConfig } from '@/sdk';

export type PostInstallLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'isTool'
  | 'handler'
> & {
  handler: InstallLogicFunctionHandler;
  shouldRunOnVersionUpgrade?: boolean;
};
