import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type SettingsFrontComponentConfig } from '@/sdk/define/front-component/settings-front-component-config';

export const defineSettingsFrontComponent: DefineEntity<
  SettingsFrontComponentConfig
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Settings front component must have a universalIdentifier');
  }

  if (!config.component) {
    errors.push('Settings front component must have a component');
  } else if (typeof config.component !== 'function') {
    errors.push('Settings front component component must be a React component');
  }

  return createValidationResult({
    config,
    errors,
  });
};
