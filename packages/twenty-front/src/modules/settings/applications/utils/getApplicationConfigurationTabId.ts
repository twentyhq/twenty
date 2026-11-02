import { SETTINGS_VARIABLES_TAB_ID } from 'twenty-shared/application';
import { getSettingsMenuItemTabId } from '@/settings/applications/utils/getSettingsMenuItemTabId';
import { isDefined } from 'twenty-shared/utils';
import { type SettingsMenuItem } from '~/generated-metadata/graphql';

export const getApplicationConfigurationTabId = ({
  hasVariablesTab,
  settingsMenuItems,
}: {
  hasVariablesTab: boolean;
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier' | 'slug'>[];
}): string | undefined => {
  if (hasVariablesTab) {
    return SETTINGS_VARIABLES_TAB_ID;
  }

  const firstSettingsMenuItem = settingsMenuItems.at(0);

  return isDefined(firstSettingsMenuItem)
    ? getSettingsMenuItemTabId(firstSettingsMenuItem)
    : undefined;
};
