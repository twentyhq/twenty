import { type ServerLogicFunctionConfig } from '@/sdk/define/logic-functions/server-logic-function-config';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';

export const defineServerLogicFunction: DefineEntity<
  ServerLogicFunctionConfig
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Server logic function must have a universalIdentifier');
  }

  if (!config.handler) {
    errors.push('Server logic function must have a handler');
  }

  if (typeof config.handler !== 'function') {
    errors.push('Server logic function handler must be a function');
  }

  if (config.serverCronTriggerSettings) {
    if (!config.serverCronTriggerSettings.pattern) {
      errors.push('Server cron trigger must have a pattern');
    }
  }

  return createValidationResult({
    config,
    errors,
  });
};
