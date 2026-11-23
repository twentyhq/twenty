import { type LogicFunctionManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type LogicFunctionTriggerSettingsKey =
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'serverRouteTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings';

// Installed logic functions store missing settings as null, manifests omit them
type LogicFunctionTriggerSettings = {
  [Key in LogicFunctionTriggerSettingsKey]?: LogicFunctionManifest[Key] | null;
};

export const getLogicFunctionTriggerTag = (
  logicFunction: LogicFunctionTriggerSettings,
): string | null => {
  if (isDefined(logicFunction.databaseEventTriggerSettings)) {
    return 'DATABASE_EVENT';
  }

  if (isDefined(logicFunction.httpRouteTriggerSettings)) {
    return 'HTTP_ROUTE';
  }

  if (isDefined(logicFunction.serverRouteTriggerSettings)) {
    return 'SERVER_ROUTE';
  }

  if (isDefined(logicFunction.cronTriggerSettings)) {
    return 'CRON';
  }

  if (isDefined(logicFunction.toolTriggerSettings)) {
    return 'TOOL';
  }

  if (isDefined(logicFunction.workflowActionTriggerSettings)) {
    return 'WORKFLOW_ACTION';
  }

  return null;
};
