import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';
import { getSettingsMenuItemsForScope } from '~/pages/settings/applications/utils/getSettingsMenuItemsForScope';

export type ApplicationUserSettingsMenuItem = {
  application: Omit<AppPreferencesApplication, 'settingsMenuItems'>;
  settingsMenuItem: NonNullable<
    AppPreferencesApplication['settingsMenuItems']
  >[number];
};

// Every USER-scoped settings menu item of every application, in the order the
// app preferences page renders them: by application name, then by the item
// position the app declared.
export const getApplicationUserSettingsMenuItems = (
  applications: AppPreferencesApplication[],
): ApplicationUserSettingsMenuItem[] =>
  [...applications]
    .sort((applicationA, applicationB) =>
      applicationA.name.localeCompare(applicationB.name),
    )
    .flatMap(({ settingsMenuItems, ...application }) =>
      getSettingsMenuItemsForScope(
        settingsMenuItems ?? [],
        SettingsMenuItemScope.USER,
      ).map((settingsMenuItem) => ({ application, settingsMenuItem })),
    );
