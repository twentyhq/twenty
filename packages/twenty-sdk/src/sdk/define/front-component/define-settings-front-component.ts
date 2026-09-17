import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { type SettingsFrontComponentConfig } from '@/sdk/define/front-component/settings-front-component-config';
import { isDefined } from 'twenty-shared/utils';

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

  if (
    isDefined(config.tab?.position) &&
    !Number.isInteger(config.tab.position)
  ) {
    errors.push('Settings front component tab position must be an integer');
  }

  if (isDefined(config.tab?.label) && config.tab.label.trim() === '') {
    errors.push('Settings front component tab label must not be empty');
  }

  return createValidationResult({
    config,
    errors,
  });
};
