import type {
  HealthCheckHandler,
  UserHealthCheckHandler,
} from '@/sdk/define/logic-functions/health-check-handler-type';
import type { LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';

type HealthCheckLogicFunctionConfigBase = Omit<
  LogicFunctionConfig,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
  | 'serverRouteTriggerSettings'
  | 'handler'
>;

export type WorkspaceHealthCheckLogicFunctionConfig =
  HealthCheckLogicFunctionConfigBase & {
    runOnUserPreferences?: false;
    handler: HealthCheckHandler;
  };

export type UserHealthCheckLogicFunctionConfig =
  HealthCheckLogicFunctionConfigBase & {
    runOnUserPreferences: true;
    handler: UserHealthCheckHandler;
  };

export type HealthCheckLogicFunctionConfig =
  | WorkspaceHealthCheckLogicFunctionConfig
  | UserHealthCheckLogicFunctionConfig;
