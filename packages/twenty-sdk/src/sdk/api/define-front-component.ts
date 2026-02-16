import { type FrontComponentConfig } from '@/sdk/api/front-component-config';
import type { DefineEntity } from '@/sdk/api/types/define-entity.type';
import { createValidationResult } from '@/sdk/api/utils/create-validation-result';

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
