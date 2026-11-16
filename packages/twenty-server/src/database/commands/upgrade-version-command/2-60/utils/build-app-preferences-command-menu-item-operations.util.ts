import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const GO_TO_SETTINGS_ACCOUNTS_UNIVERSAL_IDENTIFIER =
  '447a65cc-8535-408e-9c48-db24affb7530';

export const LEGACY_ACCOUNTS_PATH = '/settings/accounts';

export const LEGACY_PATH_BY_REMOVED_UNIVERSAL_IDENTIFIER: Record<
  string,
  string
> = {
  '4feab22c-165f-4d13-81ca-c9eb6082ca50': '/settings/accounts/emails',
  '3267ec0e-9dee-4d9b-8f1b-6005bfd90202': '/settings/accounts/calendars',
};

export const APP_PREFERENCES_COMMAND_MENU_ITEM_FIELDS = {
  label: 'Go to Apps preferences',
  shortLabel: 'Apps preferences',
  icon: 'IconApps',
  payload: { path: '/settings/app-preferences' },
} satisfies Pick<
  FlatCommandMenuItem,
  'label' | 'shortLabel' | 'icon' | 'payload'
>;

type CommandMenuItemMaps = Pick<
  FlatEntityMaps<FlatCommandMenuItem>,
  'byUniversalIdentifier'
>;

const findStandardCommandMenuItemWithPath = ({
  flatCommandMenuItemMaps,
  universalIdentifier,
  path,
}: {
  flatCommandMenuItemMaps: CommandMenuItemMaps;
  universalIdentifier: string;
  path: string;
}): FlatCommandMenuItem | undefined => {
  const commandMenuItem =
    flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];

  if (
    !isDefined(commandMenuItem) ||
    commandMenuItem.applicationUniversalIdentifier !==
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
    commandMenuItem.payload?.path !== path
  ) {
    return undefined;
  }

  return commandMenuItem;
};

export const buildAppPreferencesCommandMenuItemOperations = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: CommandMenuItemMaps;
  now: string;
}): {
  flatEntityToUpdate: FlatCommandMenuItem[];
  flatEntityToDelete: FlatCommandMenuItem[];
} => {
  const accountsCommandMenuItem = findStandardCommandMenuItemWithPath({
    flatCommandMenuItemMaps,
    universalIdentifier: GO_TO_SETTINGS_ACCOUNTS_UNIVERSAL_IDENTIFIER,
    path: LEGACY_ACCOUNTS_PATH,
  });

  return {
    flatEntityToUpdate: isDefined(accountsCommandMenuItem)
      ? [
          {
            ...accountsCommandMenuItem,
            ...APP_PREFERENCES_COMMAND_MENU_ITEM_FIELDS,
            updatedAt: now,
          },
        ]
      : [],
    flatEntityToDelete: Object.entries(
      LEGACY_PATH_BY_REMOVED_UNIVERSAL_IDENTIFIER,
    )
      .map(([universalIdentifier, path]) =>
        findStandardCommandMenuItemWithPath({
          flatCommandMenuItemMaps,
          universalIdentifier,
          path,
        }),
      )
      .filter(isDefined),
  };
};
