import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type UninstallLogicFunctionConfig } from '@/sdk/define/logic-functions/uninstall-logic-function-config';

export const defineUninstallLogicFunction: DefineEntity<
  UninstallLogicFunctionConfig
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Uninstall logic function must have a universalIdentifier');
  }

  if (!config.handler) {
    errors.push('Uninstall logic function must have a handler');
  }

  if (typeof config.handler !== 'function') {
    errors.push('Uninstall logic function handler must be a function');
  }

  return createValidationResult({
    config,
    errors,
  });
};
