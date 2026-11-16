import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const UPDATE_PERMISSION = 'objectPermissions.canUpdateObjectRecords';
const CREATE_PERMISSION = 'objectPermissions.canCreateObjectRecords';

const COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.duplicateDashboard.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier,
];

export const buildCreatePermissionCommandMenuItemUpdates = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  now: string;
}): FlatCommandMenuItem[] =>
  COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap((universalIdentifier) => {
    const commandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];
    const expression = commandMenuItem?.conditionalAvailabilityExpression;

    if (!isDefined(commandMenuItem) || !expression?.includes(UPDATE_PERMISSION)) {
      return [];
    }

    return [
      {
        ...commandMenuItem,
        conditionalAvailabilityExpression: expression
          .split(UPDATE_PERMISSION)
          .join(CREATE_PERMISSION),
        updatedAt: now,
      },
    ];
  });
