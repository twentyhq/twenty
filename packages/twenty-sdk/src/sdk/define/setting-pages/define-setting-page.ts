import { isNonEmptyString } from '@sniptt/guards';
import {
  isReservedSettingPageTitle,
  SETTING_PAGE_SCOPES,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type SettingPageConfig } from '@/sdk/define/setting-pages/setting-page-config';

export const defineSettingPage: DefineEntity<SettingPageConfig> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('SettingPage must have a universalIdentifier');
  }

  if (!isNonEmptyString(config.title)) {
    errors.push('SettingPage must have a title');
  }

  if (isNonEmptyString(config.title) && isReservedSettingPageTitle(config.title)) {
    errors.push(
      `SettingPage title "${config.title}" is reserved for the built-in settings page`,
    );
  }

  if (!config.frontComponentUniversalIdentifier) {
    errors.push(
      'SettingPage must have a frontComponentUniversalIdentifier (the universalIdentifier of the front component this page renders)',
    );
  }

  if (isDefined(config.position) && !Number.isFinite(config.position)) {
    errors.push('SettingPage position must be a number');
  }

  if (isDefined(config.scope) && !SETTING_PAGE_SCOPES.includes(config.scope)) {
    errors.push(
      `SettingPage scope must be one of ${SETTING_PAGE_SCOPES.join(', ')}`,
    );
  }

  return createValidationResult({ config, errors, warnings: [] });
};
