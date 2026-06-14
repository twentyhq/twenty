import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type LogicFunctionLike = {
  universalIdentifier?: string | null;
  cronTriggerSettings?: unknown;
  httpRouteTriggerSettings?: unknown;
  databaseEventTriggerSettings?: { eventName?: string } | null;
  toolTriggerSettings?: unknown;
  workflowActionTriggerSettings?: unknown;
};

export const getLogicFunctionTriggerLabel = (
  lf: LogicFunctionLike,
  options: {
    postInstallUniversalIdentifier?: string;
    preInstallUniversalIdentifier?: string;
  } = {},
): string => {
  if (
    isDefined(lf.universalIdentifier) &&
    lf.universalIdentifier === options.postInstallUniversalIdentifier
  ) {
    return t`Post-install`;
  }
  if (
    isDefined(lf.universalIdentifier) &&
    lf.universalIdentifier === options.preInstallUniversalIdentifier
  ) {
    return t`Pre-install`;
  }
  if (isDefined(lf.toolTriggerSettings)) return t`AI tool`;
  if (isDefined(lf.workflowActionTriggerSettings)) return t`Workflow action`;
  if (lf.cronTriggerSettings) return t`Cron`;
  if (lf.httpRouteTriggerSettings) return t`HTTP`;
  if (lf.databaseEventTriggerSettings) {
    return lf.databaseEventTriggerSettings.eventName ?? t`Database event`;
  }
  return '';
};
