import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type PostUninstallLogicFunctionConfig } from '@/sdk/define/logic-functions/post-uninstall-logic-function-config';

export const definePostUninstallLogicFunction: DefineEntity<
  PostUninstallLogicFunctionConfig
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push(
      'Post uninstall logic function must have a universalIdentifier',
    );
  }

  if (!config.handler) {
    errors.push('Post uninstall logic function must have a handler');
  }

  if (typeof config.handler !== 'function') {
    errors.push('Post uninstall logic function handler must be a function');
  }

  return createValidationResult({
    config,
    errors,
  });
};
