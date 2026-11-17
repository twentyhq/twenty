import { HTTPMethod } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { getDatabaseEventTriggerSettingsErrors } from '@/sdk/define/common/utils/get-database-event-trigger-settings-errors';
import { getRecordEventTriggerSettingsErrors } from '@/sdk/define/common/utils/get-record-event-trigger-settings-errors';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';

export const defineLogicFunction: DefineEntity<LogicFunctionConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Logic function must have a universalIdentifier');
  }

  if (!config.handler) {
    errors.push('Logic function must have a handler');
  }

  if (typeof config.handler !== 'function') {
    errors.push('Logic function handler must be a function');
  }

  if (config.httpRouteTriggerSettings) {
    if (!config.httpRouteTriggerSettings.path) {
      errors.push('Route trigger must have a path');
    }
    if (!config.httpRouteTriggerSettings.httpMethod) {
      errors.push('Route trigger must have an httpMethod');
    }
  }

  if (
    config.serverRouteTriggerSettings?.httpMethods?.some(
      (httpMethod) =>
        httpMethod !== HTTPMethod.GET && httpMethod !== HTTPMethod.POST,
    )
  ) {
    errors.push(
      'Server route trigger only supports the GET and POST http methods',
    );
  }

  if (config.cronTriggerSettings) {
    if (!config.cronTriggerSettings.pattern) {
      errors.push('Cron trigger must have a pattern');
    }
  }

  if (
    isDefined(config.eventTriggerSettings) &&
    isDefined(config.databaseEventTriggerSettings)
  ) {
    errors.push(
      'Set eventTriggerSettings or databaseEventTriggerSettings, not both',
    );
  }

  if (isDefined(config.eventTriggerSettings)) {
    errors.push(
      ...getRecordEventTriggerSettingsErrors({
        settings: config.eventTriggerSettings,
        subject: 'Event trigger',
      }),
    );
  }

  // TODO: remove with the legacy databaseEventTriggerSettings / DATABASE_EVENT manifest form
  if (isDefined(config.databaseEventTriggerSettings)) {
    errors.push(
      ...getDatabaseEventTriggerSettingsErrors({
        settings: config.databaseEventTriggerSettings,
        subject: 'Database event trigger',
        replacement: "eventTriggerSettings with on: 'recordEvent'",
      }),
    );
  }

  return createValidationResult({
    config,
    errors,
  });
};
