import type { PostInstallHandler, LogicFunctionConfig } from '@/sdk';

export type PostInstallLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'isTool'
  | 'handler'
> & {
  handler: PostInstallHandler;
  shouldRunOnVersionUpgrade?: boolean;
};
