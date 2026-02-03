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

  for (const trigger of config.triggers ?? []) {
    if (!trigger.universalIdentifier) {
      errors.push('Each trigger must have a universalIdentifier');
    }

    if (!trigger.type) {
      errors.push('Each trigger must have a type');
    }

    switch (trigger.type) {
      case 'route':
        if (!trigger.path) {
          errors.push('Route trigger must have a path');
        }
        if (!trigger.httpMethod) {
          errors.push('Route trigger must have an httpMethod');
        }
        break;

      case 'cron':
        if (!trigger.pattern) {
          errors.push('Cron trigger must have a pattern');
        }
        break;

      case 'databaseEvent':
        if (!trigger.eventName) {
          errors.push('Database event trigger must have an eventName');
        }
        break;

      default:
        errors.push(
          `Unknown trigger type: ${(trigger as { type: string }).type}`,
        );
    }
  }

  return createValidationResult({
    config,
    errors,
  });
};
