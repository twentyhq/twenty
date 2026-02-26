import { type LogicFunctionConfig } from '@/sdk/logic-functions/logic-function-config';
import { type InstallLogicFunctionHandler } from '@/sdk/logic-functions/install-logic-function-payload-type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/common/types/define-entity.type';

export const definePreInstallLogicFunction: DefineEntity<
  Omit<
    LogicFunctionConfig,
    | 'cronTriggerSettings'
    | 'databaseEventTriggerSettings'
    | 'httpRouteTriggerSettings'
    | 'isTool'
    | 'handler'
  > & {
    handler: InstallLogicFunctionHandler;
  }
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Pre install logic function must have a universalIdentifier');
  }

  if (!config.handler) {
    errors.push('Pre install logic function must have a handler');
  }

  if (typeof config.handler !== 'function') {
    errors.push('Pre install logic function handler must be a function');
  }

  return createValidationResult({
    config,
    errors,
  });
};
