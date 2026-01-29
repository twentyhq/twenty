import { type LogicFunctionConfig } from '@/application/logic-functions/logic-function-config';

export const defineLogicFunction = <T extends LogicFunctionConfig>(
  config: T,
): T => {
  if (!config.universalIdentifier) {
    throw new Error('Function must have a universalIdentifier');
  }

  if (typeof config.handler !== 'function') {
    throw new Error('Function must have a handler');
  }

  // Validate each trigger
  for (const trigger of config.triggers ?? []) {
    if (!trigger.universalIdentifier) {
      throw new Error('Each trigger must have a universalIdentifier');
    }

    if (!trigger.type) {
      throw new Error('Each trigger must have a type');
    }

    switch (trigger.type) {
      case 'route':
        if (!trigger.path) {
          throw new Error('Route trigger must have a path');
        }
        if (!trigger.httpMethod) {
          throw new Error('Route trigger must have an httpMethod');
        }
        break;

      case 'cron':
        if (!trigger.pattern) {
          throw new Error('Cron trigger must have a pattern');
        }
        break;

      case 'databaseEvent':
        if (!trigger.eventName) {
          throw new Error('Database event trigger must have an eventName');
        }
        break;

      default:
        throw new Error(
          `Unknown trigger type: ${(trigger as { type: string }).type}`,
        );
    }
  }

  return config;
};
