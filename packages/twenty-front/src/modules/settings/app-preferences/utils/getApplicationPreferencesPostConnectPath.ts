import { APPLICATION_PREFERENCES_GENERAL_TAB_ID } from '@/settings/app-preferences/constants/ApplicationPreferencesGeneralTabId';
import { getSettingsMenuItemsForScope } from '@/settings/applications/utils/getSettingsMenuItemsForScope';
import { getSettingsMenuItemTabId } from '@/settings/applications/utils/getSettingsMenuItemTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  type SettingsMenuItem,
  SettingsMenuItemScope,
} from '~/generated-metadata/graphql';

export const getApplicationPreferencesPostConnectPath = ({
  applicationId,
  settingsMenuItems,
}: {
  applicationId: string;
  settingsMenuItems: Pick<
    SettingsMenuItem,
    'universalIdentifier' | 'slug' | 'position' | 'scope'
  >[];
}): string => {
  const firstUserSettingsMenuItem = getSettingsMenuItemsForScope({
    settingsMenuItems,
    scope: SettingsMenuItemScope.USER,
  }).at(0);

  return getSettingsPath(
    SettingsPath.AppPreferencesApp,
    { applicationId },
    undefined,
    isDefined(firstUserSettingsMenuItem)
      ? getSettingsMenuItemTabId(firstUserSettingsMenuItem)
      : APPLICATION_PREFERENCES_GENERAL_TAB_ID,
  );
};
