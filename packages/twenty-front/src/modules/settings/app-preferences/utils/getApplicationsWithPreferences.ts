import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';
import { sortSettingsMenuItemsByPosition } from '@/settings/applications/utils/sortSettingsMenuItemsByPosition';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type MyApplicationPreferencesQuery } from '~/generated-metadata/graphql';

type ApplicationsWithPreferencesWorkspace = Pick<
  CurrentWorkspace,
  'installedApplications' | 'workspaceCustomApplication'
>;

export const getApplicationsWithPreferences = ({
  applicationPreferences,
  currentWorkspace,
}: {
  applicationPreferences: MyApplicationPreferencesQuery['myApplicationPreferences'];
  currentWorkspace: ApplicationsWithPreferencesWorkspace | null | undefined;
}): ApplicationWithPreferences[] => {
  const installedApplications = currentWorkspace?.installedApplications ?? [];

  const getDisplayName = ({ application }: ApplicationWithPreferences) =>
    getApplicationDisplayName({ application, currentWorkspace });

  return applicationPreferences
    .flatMap(({ applicationId, settingsMenuItems, variables }) => {
      const application = installedApplications.find(
        (installedApplication) => installedApplication.id === applicationId,
      );
      const displayedVariables = getDisplayedApplicationVariables(variables);

      if (
        !isDefined(application) ||
        (!isNonEmptyArray(settingsMenuItems) &&
          !isNonEmptyArray(displayedVariables))
      ) {
        return [];
      }

      return [
        {
          application,
          settingsMenuItems: sortSettingsMenuItemsByPosition(settingsMenuItems),
          variables: displayedVariables,
        },
      ];
    })
    .sort(
      (applicationWithPreferencesA, applicationWithPreferencesB) =>
        getDisplayName(applicationWithPreferencesA).localeCompare(
          getDisplayName(applicationWithPreferencesB),
        ) ||
        applicationWithPreferencesA.application.id.localeCompare(
          applicationWithPreferencesB.application.id,
        ),
    );
};
