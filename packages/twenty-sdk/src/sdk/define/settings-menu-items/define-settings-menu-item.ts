import { isNonEmptyString } from '@sniptt/guards';
import {
  isReservedSettingsMenuItemTitle,
  SETTINGS_MENU_ITEM_SCOPES,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type SettingsMenuItemConfig } from '@/sdk/define/settings-menu-items/settings-menu-item-config';

export const defineSettingsMenuItem: DefineEntity<SettingsMenuItemConfig> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('SettingsMenuItem must have a universalIdentifier');
  }

  if (!isNonEmptyString(config.title)) {
    errors.push('SettingsMenuItem must have a title');
  }

  if (
    isNonEmptyString(config.title) &&
    isReservedSettingsMenuItemTitle(config.title)
  ) {
    errors.push(
      `SettingsMenuItem title "${config.title}" is reserved for the built-in settings menu item`,
    );
  }

  if (!config.frontComponentUniversalIdentifier) {
    errors.push(
      'SettingsMenuItem must have a frontComponentUniversalIdentifier (the universalIdentifier of the front component this page renders)',
    );
  }

  if (isDefined(config.position) && !Number.isFinite(config.position)) {
    errors.push('SettingsMenuItem position must be a number');
  }

  if (
    isDefined(config.scope) &&
    !SETTINGS_MENU_ITEM_SCOPES.includes(config.scope)
  ) {
    errors.push(
      `SettingsMenuItem scope must be one of ${SETTINGS_MENU_ITEM_SCOPES.join(', ')}`,
    );
  }

  return createValidationResult({ config, errors, warnings: [] });
};
