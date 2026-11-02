import { type SettingsApplicationsTableLinkTarget } from '@/settings/applications/types/SettingsApplicationsTableLinkTarget';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const getSettingsApplicationLink = ({
  linkTarget,
  applicationId,
}: {
  linkTarget: SettingsApplicationsTableLinkTarget;
  applicationId: string;
}) =>
  linkTarget === 'applicationPreferences'
    ? getSettingsPath(SettingsPath.AppPreferencesApp, { applicationId })
    : getSettingsPath(SettingsPath.ApplicationDetail, { applicationId });
