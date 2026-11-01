import { type SettingsMenuItem } from '~/generated-metadata/graphql';

export const sortSettingsMenuItemsByPosition = <
  OrderableSettingsMenuItem extends Pick<
    SettingsMenuItem,
    'universalIdentifier' | 'position'
  >,
>(
  settingsMenuItems: OrderableSettingsMenuItem[],
): OrderableSettingsMenuItem[] =>
  [...settingsMenuItems].sort(
    (settingsMenuItemA, settingsMenuItemB) =>
      settingsMenuItemA.position - settingsMenuItemB.position ||
      settingsMenuItemA.universalIdentifier.localeCompare(
        settingsMenuItemB.universalIdentifier,
      ),
  );
