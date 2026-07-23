import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type PreUninstallLogicFunctionConfig } from '@/sdk/define/logic-functions/pre-uninstall-logic-function-config';

export const definePreUninstallLogicFunction: DefineEntity<
  PreUninstallLogicFunctionConfig
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push(
      'Pre uninstall logic function must have a universalIdentifier',
    );
  }

  if (!config.handler) {
    errors.push('Pre uninstall logic function must have a handler');
  }

  if (typeof config.handler !== 'function') {
    errors.push('Pre uninstall logic function handler must be a function');
  }

  return createValidationResult({
    config,
    errors,
  });
};
