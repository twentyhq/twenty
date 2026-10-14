import type { InstallHandler } from '@/sdk/define/logic-functions/install-payload-type';
import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

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

export type TranslatablePreInstallLogicFunctionConfig =
  WithTranslatableProperties<
    PreInstallLogicFunctionConfig,
    'name' | 'description'
  >;
