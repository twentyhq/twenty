import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { getResolvedApplicationDescription } from '@/applications/utils/getResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAccountAppLogoUrl';
import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { type SettingsApplicationsTableRowItem } from '@/settings/applications/types/SettingsApplicationsTableRowItem';
import { sortApplicationsWithOAuthOnlyLast } from '@/settings/applications/utils/sortApplicationsWithOAuthOnlyLast';
import { i18n } from '@lingui/core';
import { isNonEmptyArray } from 'twenty-shared/utils';

type WorkspaceLike = {
  workspaceCustomApplication?: { id?: string | null } | null;
};

const getApplicationRowItem = (
  application: SettingsApplicationsTableApplication,
  currentWorkspace: WorkspaceLike | null | undefined,
): SettingsApplicationsTableRowItem => ({
  id: application.id,
  name: getApplicationDisplayName({ application, currentWorkspace }),
  description: getResolvedApplicationDescription({
    application,
    currentWorkspace,
  }),
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
  currentWorkspace,
}: {
  applications: SettingsApplicationsTableApplication[];
  builtInAccountApps: BuiltInAccountApp[];
  currentWorkspace: WorkspaceLike | null | undefined;
}): SettingsApplicationsTableRowItem[] => {
  const sortedApplications = sortApplicationsWithOAuthOnlyLast(applications);
  const toApplicationRowItem = (
    application: SettingsApplicationsTableApplication,
  ) => getApplicationRowItem(application, currentWorkspace);

  if (!isNonEmptyArray(builtInAccountApps)) {
    return sortedApplications.map(toApplicationRowItem);
  }

  return [
    ...sortedApplications
      .filter(isTwentyStandardApplication)
      .map(toApplicationRowItem),
    ...builtInAccountApps.map(getBuiltInAccountAppRowItem),
    ...sortedApplications
      .filter((application) => !isTwentyStandardApplication(application))
      .map(toApplicationRowItem),
  ];
};
