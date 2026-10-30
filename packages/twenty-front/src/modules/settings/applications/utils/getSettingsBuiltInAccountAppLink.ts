import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { type SettingsApplicationsTableLinkTarget } from '@/settings/applications/types/SettingsApplicationsTableLinkTarget';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const getSettingsBuiltInAccountAppLink = ({
  linkTarget,
  builtInAccountAppId,
}: {
  linkTarget: SettingsApplicationsTableLinkTarget;
  builtInAccountAppId: BuiltInAccountApp['id'];
}) =>
  linkTarget === 'applicationPreferences'
    ? getSettingsPath(SettingsPath.AppPreferencesApp, {
        applicationId: builtInAccountAppId,
      })
    : getSettingsPath(SettingsPath.ApplicationDetail, {
        applicationId: builtInAccountAppId,
      });
