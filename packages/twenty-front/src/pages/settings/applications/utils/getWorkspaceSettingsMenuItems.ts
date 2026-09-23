import {
  type SettingsMenuItem,
  SettingsMenuItemScope,
} from '~/generated-metadata/graphql';

export const getWorkspaceSettingsMenuItems = <
  OrderableSettingsMenuItem extends Pick<
    SettingsMenuItem,
    'universalIdentifier' | 'position' | 'scope'
  >,
>(
  settingsMenuItems: OrderableSettingsMenuItem[],
): OrderableSettingsMenuItem[] =>
  settingsMenuItems
    .filter(
      (settingsMenuItem) =>
        settingsMenuItem.scope === SettingsMenuItemScope.WORKSPACE,
    )
    .sort(
      (settingsMenuItemA, settingsMenuItemB) =>
        settingsMenuItemA.position - settingsMenuItemB.position ||
        settingsMenuItemA.universalIdentifier.localeCompare(
          settingsMenuItemB.universalIdentifier,
        ),
    );
