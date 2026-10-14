import type { HealthCheckHandler } from '@/sdk/define/logic-functions/health-check-handler-type';
import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type HealthCheckLogicFunctionConfig = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
  | 'serverRouteTriggerSettings'
  | 'handler'
> & {
  handler: HealthCheckHandler;
};

export type TranslatableHealthCheckLogicFunctionConfig =
  WithTranslatableProperties<
    HealthCheckLogicFunctionConfig,
    'name' | 'description'
  >;
