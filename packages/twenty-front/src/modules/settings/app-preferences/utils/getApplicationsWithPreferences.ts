import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';
import { sortSettingsMenuItemsByPosition } from '@/settings/applications/utils/sortSettingsMenuItemsByPosition';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type MyApplicationPreferencesQuery } from '~/generated-metadata/graphql';

export const getApplicationsWithPreferences = ({
  applicationPreferences,
  applications,
  currentWorkspace,
}: {
  applicationPreferences: MyApplicationPreferencesQuery['myApplicationPreferences'];
  applications: FlatApplication[];
  currentWorkspace:
    | Pick<CurrentWorkspace, 'workspaceCustomApplication'>
    | null
    | undefined;
}): ApplicationWithPreferences[] => {
  const getDisplayName = ({ application }: ApplicationWithPreferences) =>
    getApplicationDisplayName({ application, currentWorkspace });

  return applicationPreferences
    .flatMap(({ applicationId, settingsMenuItems, variables }) => {
      const application = applications.find(
        (candidateApplication) => candidateApplication.id === applicationId,
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
