import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export const LEGACY_GO_TO_ROLES_SETTINGS_PATH = '/settings/roles';

export const GO_TO_ROLES_SETTINGS_PATH = '/settings/members#roles';

const GO_TO_ROLES_SETTINGS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsRoles.universalIdentifier;

export const buildFixGoToRolesSettingsCommandMenuItemPathSyncOperations = ({
  existingFlatCommandMenuItemMaps,
  now,
}: {
  existingFlatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  now: string;
}): FlatEntityToCreateDeleteUpdate<'commandMenuItem'> => {
  const existingGoToRolesSettingsCommandMenuItem =
    existingFlatCommandMenuItemMaps.byUniversalIdentifier[
      GO_TO_ROLES_SETTINGS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
    ];

  const existingPath =
    existingGoToRolesSettingsCommandMenuItem?.payload &&
    'path' in existingGoToRolesSettingsCommandMenuItem.payload
      ? existingGoToRolesSettingsCommandMenuItem.payload.path
      : undefined;

  if (
    !isDefined(existingGoToRolesSettingsCommandMenuItem) ||
    existingPath !== LEGACY_GO_TO_ROLES_SETTINGS_PATH
  ) {
    return {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    };
  }

  return {
    flatEntityToCreate: [],
    flatEntityToDelete: [],
    flatEntityToUpdate: [
      {
        ...existingGoToRolesSettingsCommandMenuItem,
        payload: { path: GO_TO_ROLES_SETTINGS_PATH },
        updatedAt: now,
      },
    ],
  };
};
