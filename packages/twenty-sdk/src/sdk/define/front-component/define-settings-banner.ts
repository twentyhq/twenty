import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type SettingsBannerConfig } from '@/sdk/define/front-component/settings-banner-config';

export const defineSettingsBanner: DefineEntity<SettingsBannerConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Settings banner must have a universalIdentifier');
  }

  if (!config.component) {
    errors.push('Settings banner must have a component');
  } else if (typeof config.component !== 'function') {
    errors.push('Settings banner component must be a React component');
  }

  return createValidationResult({
    config,
    errors,
  });
};
