import type { HealthCheckHandler } from '@/sdk/define/logic-functions/health-check-handler-type';
import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';

export type HealthCheckLogicFunctionConfig = Omit<
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
  handler: HealthCheckHandler;
};
