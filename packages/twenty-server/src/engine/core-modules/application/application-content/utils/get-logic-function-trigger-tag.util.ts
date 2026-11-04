import { isDefined } from 'twenty-shared/utils';

type LogicFunctionTriggerSettings = {
  cronTriggerSettings?: unknown;
  databaseEventTriggerSettings?: unknown;
  httpRouteTriggerSettings?: unknown;
  serverRouteTriggerSettings?: unknown;
  toolTriggerSettings?: unknown;
  workflowActionTriggerSettings?: unknown;
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
