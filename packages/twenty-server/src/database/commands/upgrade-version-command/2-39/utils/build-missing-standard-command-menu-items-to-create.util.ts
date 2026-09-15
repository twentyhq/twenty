import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

// Provisions standard commands a workspace predates. A command whose object
// the workspace does not have is left out rather than failing the whole run.
export const buildMissingStandardCommandMenuItemsToCreate = ({
  commandMenuItemNames,
  flatCommandMenuItemByUniversalIdentifier,
  flatObjectMetadataMaps,
  workspaceId,
  now,
}: {
  commandMenuItemNames: (keyof typeof STANDARD_COMMAND_MENU_ITEMS)[];
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    | Pick<
        FlatCommandMenuItem,
        'applicationId' | 'applicationUniversalIdentifier'
      >
    | undefined
  >;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  workspaceId: string;
  now: string;
}): FlatCommandMenuItem[] => {
  const twentyStandardApplicationId = Object.values(
    flatCommandMenuItemByUniversalIdentifier,
  ).find(
    (flatCommandMenuItem) =>
      flatCommandMenuItem?.applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
  )?.applicationId;

  if (!isDefined(twentyStandardApplicationId)) {
    return [];
  }

  return commandMenuItemNames
    .filter((commandMenuItemName) => {
      const definition = STANDARD_COMMAND_MENU_ITEMS[commandMenuItemName];

      const isAlreadyProvisioned = isDefined(
        flatCommandMenuItemByUniversalIdentifier[definition.universalIdentifier],
      );

      const hasAvailabilityObject =
        !isDefined(definition.availabilityObjectMetadataUniversalIdentifier) ||
        isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[
            definition.availabilityObjectMetadataUniversalIdentifier
          ],
        );

      return !isAlreadyProvisioned && hasAvailabilityObject;
    })
    .map((commandMenuItemName) =>
      createStandardCommandMenuItemFlatMetadata({
        commandMenuItemName,
        commandMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId,
        dependencyFlatEntityMaps: { flatObjectMetadataMaps },
        now,
      }),
    );
};
