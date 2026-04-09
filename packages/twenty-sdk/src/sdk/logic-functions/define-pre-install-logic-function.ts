import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/common/types/define-entity.type';
import { type PreInstallLogicFunctionConfig } from '@/sdk/logic-functions/pre-install-logic-function-config';

export const definePreInstallLogicFunction: DefineEntity<
  PreInstallLogicFunctionConfig
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
