import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

export const buildGoToWorkflowsCommandMenuItemToCreate = ({
  flatCommandMenuItemsByUniversalIdentifier,
  flatObjectMetadataMaps,
  workspaceId,
  now,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  workspaceId: string;
  now: string;
}): FlatCommandMenuItem | undefined => {
  if (
    isDefined(
      flatCommandMenuItemsByUniversalIdentifier[
        STANDARD_COMMAND_MENU_ITEMS.goToWorkflows.universalIdentifier
      ],
    )
  ) {
    return undefined;
  }

  const twentyStandardApplicationId = Object.values(
    flatCommandMenuItemsByUniversalIdentifier,
  ).find(
    (flatCommandMenuItem) =>
      flatCommandMenuItem?.applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
  )?.applicationId;

  if (!isDefined(twentyStandardApplicationId)) {
    return undefined;
  }

  return createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName: 'goToWorkflows',
    commandMenuItemId: v4(),
    workspaceId,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps: { flatObjectMetadataMaps },
    now,
  });
};
