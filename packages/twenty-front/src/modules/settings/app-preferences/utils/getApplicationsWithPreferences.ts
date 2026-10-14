import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';
import { getSettingsMenuItemsForScope } from '@/settings/applications/utils/getSettingsMenuItemsForScope';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  type MyApplicationPreferencesQuery,
  SettingsMenuItemScope,
} from '~/generated-metadata/graphql';

export const getApplicationsWithPreferences = ({
  applicationPreferences,
  installedApplications,
}: {
  applicationPreferences: MyApplicationPreferencesQuery['myApplicationPreferences'];
  installedApplications: CurrentWorkspace['installedApplications'];
}): ApplicationWithPreferences[] =>
  applicationPreferences.flatMap(
    ({ applicationId, settingsMenuItems, variables }) => {
      const application = installedApplications.find(
        (installedApplication) => installedApplication.id === applicationId,
      );
      const userSettingsMenuItems = getSettingsMenuItemsForScope({
        settingsMenuItems,
        scope: SettingsMenuItemScope.USER,
      });
      const displayedVariables = getDisplayedApplicationVariables(variables);

      if (
        !isDefined(application) ||
        (!isNonEmptyArray(userSettingsMenuItems) &&
          !isNonEmptyArray(displayedVariables))
      ) {
        return [];
      }

      return [
        {
          application,
          settingsMenuItems: userSettingsMenuItems,
          variables: displayedVariables,
        },
      ];
    },
  );
