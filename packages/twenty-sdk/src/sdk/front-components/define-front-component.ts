import { type FrontComponentConfig } from '@/sdk/front-components/front-component-config';
import type { DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk';

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
