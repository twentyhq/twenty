import type { InstallHandler, LogicFunctionConfig } from '@/sdk';

export type PostInstallLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'isTool'
  | 'handler'
> & {
  handler: InstallHandler;
  shouldRunOnVersionUpgrade?: boolean;
};
