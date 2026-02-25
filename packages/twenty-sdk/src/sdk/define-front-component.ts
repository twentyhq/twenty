import { createValidationResult } from '@/sdk';
import type { DefineEntity } from '@/sdk/common/types/define-entity.type';
import { type FrontComponentConfig } from '@/sdk/front-component-config';

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

  if (config.command) {
    if (!config.command.universalIdentifier) {
      errors.push('Command must have a universalIdentifier');
    }

    if (!config.command.label) {
      errors.push('Command must have a label');
    }
  }

  return createValidationResult({
    config,
    errors,
  });
};
