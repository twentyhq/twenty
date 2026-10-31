import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { getResolvedApplicationDescription } from '@/applications/utils/getResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { findBuiltInMcpClientApp } from '@/settings/app-preferences/utils/findBuiltInMcpClientApp';
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
}): SettingsApplicationsTableRowItem => {
  // OAuth-only installs have no bundle to carry a logo
  const builtInMcpClientApp = findBuiltInMcpClientApp(
    application.applicationRegistration?.wellKnownOAuthClient,
  );

  return {
    id: application.id,
    name: getApplicationDisplayName({ application, currentWorkspace }),
    description: getResolvedApplicationDescription({
      application,
      currentWorkspace,
    }),
    logoUrl:
      application.logoUrl ??
      (isDefined(builtInMcpClientApp)
        ? getBuiltInAppLogoUrl(builtInMcpClientApp)
        : undefined),
    universalIdentifier: application.universalIdentifier,
    sourceType: application.applicationRegistration?.sourceType,
  };
};

const getBuiltInAppRowItem = (
  builtInApp: BuiltInApp,
): SettingsApplicationsTableRowItem => ({
  id: builtInApp.id,
  name: i18n._(builtInApp.name),
  description: i18n._(builtInApp.description),
  logoUrl: getBuiltInAppLogoUrl(builtInApp),
});

export const getSettingsApplicationsTableRowItems = ({
  applications,
  builtInApps,
  currentWorkspace,
}: {
  applications: SettingsApplicationsTableApplication[];
  builtInApps: BuiltInApp[];
  currentWorkspace: RowItemsWorkspace | null | undefined;
}): SettingsApplicationsTableRowItem[] => {
  const sortedApplications = sortApplicationsWithOAuthOnlyLast(applications);
  const toApplicationRowItem = (
    application: SettingsApplicationsTableApplication,
  ) => getApplicationRowItem({ application, currentWorkspace });

  if (!isNonEmptyArray(builtInApps)) {
    return sortedApplications.map(toApplicationRowItem);
  }

  return [
    ...sortedApplications
      .filter(isTwentyStandardApplication)
      .map(toApplicationRowItem),
    ...builtInApps.map(getBuiltInAppRowItem),
    ...sortedApplications
      .filter((application) => !isTwentyStandardApplication(application))
      .map(toApplicationRowItem),
  ];
};
