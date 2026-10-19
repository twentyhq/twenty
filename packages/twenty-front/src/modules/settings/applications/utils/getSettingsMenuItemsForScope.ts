import { sortSettingsMenuItemsByPosition } from '@/settings/applications/utils/sortSettingsMenuItemsByPosition';
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
  sortSettingsMenuItemsByPosition(
    settingsMenuItems.filter(
      (settingsMenuItem) => settingsMenuItem.scope === scope,
    ),
  );
