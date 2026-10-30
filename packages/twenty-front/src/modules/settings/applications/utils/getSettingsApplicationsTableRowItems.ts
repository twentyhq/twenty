import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAccountAppLogoUrl';
import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { type SettingsApplicationsTableRowItem } from '@/settings/applications/types/SettingsApplicationsTableRowItem';
import { sortApplicationsWithOAuthOnlyLast } from '@/settings/applications/utils/sortApplicationsWithOAuthOnlyLast';
import { i18n } from '@lingui/core';
import { isNonEmptyArray } from 'twenty-shared/utils';

const getApplicationRowItem = (
  application: SettingsApplicationsTableApplication,
): SettingsApplicationsTableRowItem => ({
  id: application.id,
  name: application.name,
  description: application.description ?? null,
  logoUrl: application.logoUrl,
  universalIdentifier: application.universalIdentifier,
  sourceType: application.applicationRegistration?.sourceType,
});

const getBuiltInAccountAppRowItem = (
  builtInAccountApp: BuiltInAccountApp,
): SettingsApplicationsTableRowItem => ({
  id: builtInAccountApp.id,
  name: i18n._(builtInAccountApp.name),
  description: i18n._(builtInAccountApp.description),
  logoUrl: getBuiltInAccountAppLogoUrl(builtInAccountApp),
});

export const getSettingsApplicationsTableRowItems = ({
  applications,
  builtInAccountApps,
}: {
  applications: SettingsApplicationsTableApplication[];
  builtInAccountApps: BuiltInAccountApp[];
}): SettingsApplicationsTableRowItem[] => {
  const sortedApplications = sortApplicationsWithOAuthOnlyLast(applications);

  if (!isNonEmptyArray(builtInAccountApps)) {
    return sortedApplications.map(getApplicationRowItem);
  }

  return [
    ...sortedApplications
      .filter(isTwentyStandardApplication)
      .map(getApplicationRowItem),
    ...builtInAccountApps.map(getBuiltInAccountAppRowItem),
    ...sortedApplications
      .filter((application) => !isTwentyStandardApplication(application))
      .map(getApplicationRowItem),
  ];
};
