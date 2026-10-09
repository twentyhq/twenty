import {
  type SettingsMenuItem,
  type SettingsMenuItemScope,
} from '~/generated-metadata/graphql';

export const getSettingsMenuItemsForScope = <
  OrderableSettingsMenuItem extends Pick<
    SettingsMenuItem,
    'universalIdentifier' | 'position' | 'scope'
  >,
>({
  settingsMenuItems,
  scope,
}: {
  settingsMenuItems: OrderableSettingsMenuItem[];
  scope: SettingsMenuItemScope;
}): OrderableSettingsMenuItem[] =>
  settingsMenuItems
    .filter((settingsMenuItem) => settingsMenuItem.scope === scope)
    .sort(
      (settingsMenuItemA, settingsMenuItemB) =>
        settingsMenuItemA.position - settingsMenuItemB.position ||
        settingsMenuItemA.universalIdentifier.localeCompare(
          settingsMenuItemB.universalIdentifier,
        ),
    );
