import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';

export const defineFrontComponent: DefineEntity<FrontComponentConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Front component must have a universalIdentifier');
  }

  if (!config.component) {
    errors.push('Front component must have a component');
  }

  if (typeof config.component !== 'function') {
    errors.push('Front component component must be a React component');
  }

  return createValidationResult({
    config,
    errors,
  });
};
