import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import type { UninstallHandler } from '@/sdk/define/logic-functions/uninstall-payload-type';
import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type UninstallLogicFunctionConfig = Omit<
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

export type TranslatableUninstallLogicFunctionConfig =
  WithTranslatableProperties<
    UninstallLogicFunctionConfig,
    'name' | 'description'
  >;
