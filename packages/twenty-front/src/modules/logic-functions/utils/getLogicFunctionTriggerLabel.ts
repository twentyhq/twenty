import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type DatabaseEventTriggerLike = { eventName?: string };

type LogicFunctionLike = {
  universalIdentifier?: string | null;
  cronTriggerSettings?: unknown;
  httpRouteTriggerSettings?: unknown;
  databaseEventTriggerSettings?:
    | DatabaseEventTriggerLike
    | DatabaseEventTriggerLike[]
    | null;
  toolTriggerSettings?: unknown;
  workflowActionTriggerSettings?: unknown;
};

export const getLogicFunctionTriggerLabel = (
  lf: LogicFunctionLike,
  options: {
    postInstallUniversalIdentifier?: string;
    preInstallUniversalIdentifier?: string;
    uninstallUniversalIdentifier?: string;
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
  if (
    isDefined(lf.universalIdentifier) &&
    lf.universalIdentifier === options.uninstallUniversalIdentifier
  ) {
    return t`Uninstall`;
  }
  if (isDefined(lf.toolTriggerSettings)) return t`AI tool`;
  if (isDefined(lf.workflowActionTriggerSettings)) return t`Workflow action`;
  if (lf.cronTriggerSettings) return t`Cron`;
  if (lf.httpRouteTriggerSettings) return t`HTTP`;
  if (isDefined(lf.databaseEventTriggerSettings)) {
    // Manifests built with older SDKs still hold a single trigger object
    const databaseEventTriggers = Array.isArray(lf.databaseEventTriggerSettings)
      ? lf.databaseEventTriggerSettings
      : [lf.databaseEventTriggerSettings];
    const eventNames = databaseEventTriggers
      .map((trigger) => trigger.eventName)
      .filter(isNonEmptyString);

    return isNonEmptyArray(eventNames)
      ? eventNames.join(', ')
      : t`Database event`;
  }
  return '';
};
