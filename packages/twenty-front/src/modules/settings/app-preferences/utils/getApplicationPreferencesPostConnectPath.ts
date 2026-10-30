import { APPLICATION_PREFERENCES_GENERAL_TAB_ID } from '@/settings/app-preferences/constants/ApplicationPreferencesGeneralTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type SettingsMenuItem } from '~/generated-metadata/graphql';

export const getApplicationPreferencesPostConnectPath = ({
  applicationId,
  settingsMenuItems,
}: {
  applicationId: string;
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier'>[];
}) =>
  getSettingsPath(
    SettingsPath.AppPreferencesApp,
    { applicationId },
    undefined,
    settingsMenuItems.at(0)?.universalIdentifier ??
      APPLICATION_PREFERENCES_GENERAL_TAB_ID,
  );
