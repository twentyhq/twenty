import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type SettingsTabFrontComponentConfig } from '@/sdk/define/front-component/settings-tab-front-component-config';

export const defineSettingsTabFrontComponent: DefineEntity<
  SettingsTabFrontComponentConfig
> = (config) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Settings tab front component must have a universalIdentifier');
  }

  if (!config.component) {
    errors.push('Settings tab front component must have a component');
  }

  if (typeof config.component !== 'function') {
    errors.push(
      'Settings tab front component component must be a React component',
    );
  }

  return createValidationResult({
    config,
    errors,
  });
};
