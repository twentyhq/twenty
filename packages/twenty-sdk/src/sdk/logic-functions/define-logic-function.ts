import { type LogicFunctionConfig } from '@/sdk/logic-functions/logic-function-config';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/common/types/define-entity.type';

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

  if (config.cronTriggerSettings) {
    if (!config.cronTriggerSettings.pattern) {
      errors.push('Cron trigger must have a pattern');
    }
  }

  if (config.databaseEventTriggerSettings) {
    if (!config.databaseEventTriggerSettings.eventName) {
      errors.push('Database event trigger must have an eventName');
    }
  }

  return createValidationResult({
    config,
    errors,
  });
};
