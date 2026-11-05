import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { getResolvedApplicationDescription } from '@/applications/utils/getResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { getBuiltInAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAppLogoUrl';
import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { type SettingsApplicationsTableRowItem } from '@/settings/applications/types/SettingsApplicationsTableRowItem';
import { sortApplicationsWithOAuthOnlyLast } from '@/settings/applications/utils/sortApplicationsWithOAuthOnlyLast';
import { i18n } from '@lingui/core';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type RowItemsWorkspace = Pick<CurrentWorkspace, 'workspaceCustomApplication'>;

const getApplicationRowItem = ({
  application,
  currentWorkspace,
}: {
  application: SettingsApplicationsTableApplication;
  currentWorkspace: RowItemsWorkspace | null | undefined;
}): SettingsApplicationsTableRowItem => ({
  id: application.id,
  name: getApplicationDisplayName({ application, currentWorkspace }),
  description: getResolvedApplicationDescription({
    application,
    currentWorkspace,
  }),
  logoUrl: application.logoUrl,
  universalIdentifier: application.universalIdentifier,
  // An app without a registration ships with the server, so it reads as built-in
  sourceType: isDefined(application.applicationRegistration)
    ? application.sourceType
    : undefined,
});

const getBuiltInAppRowItem = (
  builtInApp: BuiltInApp,
): SettingsApplicationsTableRowItem => ({
  id: builtInApp.id,
  name: i18n._(builtInApp.name),
  description: i18n._(builtInApp.description),
  logoUrl: getBuiltInAppLogoUrl(builtInApp),
});

const getConnectableAppRowItem = (
  connectableApp: ConnectableApp,
): SettingsApplicationsTableRowItem => ({
  id: connectableApp.id,
  name: connectableApp.name,
  description: connectableApp.description,
  logoUrl: connectableApp.logoUrl,
});

export const getSettingsApplicationsTableRowItems = ({
  applications,
  builtInApps,
  connectableApps = [],
  currentWorkspace,
}: {
  applications: SettingsApplicationsTableApplication[];
  builtInApps: BuiltInApp[];
  connectableApps?: ConnectableApp[];
  currentWorkspace: RowItemsWorkspace | null | undefined;
}): SettingsApplicationsTableRowItem[] => {
  const builtInRowItems = [
    ...builtInApps.map(getBuiltInAppRowItem),
    ...connectableApps.map(getConnectableAppRowItem),
  ];
  const sortedApplications = sortApplicationsWithOAuthOnlyLast(applications);
  const toApplicationRowItem = (
    application: SettingsApplicationsTableApplication,
  ) => getApplicationRowItem({ application, currentWorkspace });

  if (!isNonEmptyArray(builtInRowItems)) {
    return sortedApplications.map(toApplicationRowItem);
  }

  return [
    ...sortedApplications
      .filter(isTwentyStandardApplication)
      .map(toApplicationRowItem),
    ...builtInRowItems,
    ...sortedApplications
      .filter((application) => !isTwentyStandardApplication(application))
      .map(toApplicationRowItem),
  ];
};
