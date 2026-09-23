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
    // Positions are floats an application picks, so two applications — or one
    // that never renumbered — can land on the same one. Breaking the tie on
    // universalIdentifier keeps the tabs in the same order in every workspace
    // rather than in whatever order the sync happened to install them.
    .sort(
      (settingsMenuItemA, settingsMenuItemB) =>
        settingsMenuItemA.position - settingsMenuItemB.position ||
        settingsMenuItemA.universalIdentifier.localeCompare(
          settingsMenuItemB.universalIdentifier,
        ),
    );
