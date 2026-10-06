import {
  type SettingsMenuItem,
  SettingsMenuItemScope,
} from '~/generated-metadata/graphql';
import { getSettingsMenuItemsForScope } from '~/pages/settings/applications/utils/getSettingsMenuItemsForScope';

export const getWorkspaceSettingsMenuItems = <
  OrderableSettingsMenuItem extends Pick<
    SettingsMenuItem,
    'universalIdentifier' | 'position' | 'scope'
  >,
>(
  settingsMenuItems: OrderableSettingsMenuItem[],
): OrderableSettingsMenuItem[] =>
  getSettingsMenuItemsForScope(
    settingsMenuItems,
    SettingsMenuItemScope.WORKSPACE,
  );
