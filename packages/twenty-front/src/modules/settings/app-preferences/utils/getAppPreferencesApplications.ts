import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { getSettingsMenuItemsForScope } from '~/pages/settings/applications/utils/getSettingsMenuItemsForScope';

// The installed applications a member has something to set on: the ones
// declaring USER settings menu items and the ones they connected an account
// through, by name.
export const getAppPreferencesApplications = (
  applications: AppPreferencesApplication[],
  accounts: Pick<ConnectedAccount, 'applicationId'>[],
): AppPreferencesApplication[] =>
  applications
    .filter(
      (application) =>
        isNonEmptyArray(
          getSettingsMenuItemsForScope(
            application.settingsMenuItems ?? [],
            SettingsMenuItemScope.USER,
          ),
        ) ||
        accounts.some((account) => account.applicationId === application.id),
    )
    .sort((applicationA, applicationB) =>
      applicationA.name.localeCompare(applicationB.name),
    );
