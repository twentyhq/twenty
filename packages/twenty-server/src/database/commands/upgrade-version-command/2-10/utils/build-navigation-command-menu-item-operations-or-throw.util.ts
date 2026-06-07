import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  buildNavigationConditionalAvailabilityExpression,
  buildNavigationFlatCommandMenuItem,
  NAVIGATION_COMMAND_UUID_NAMESPACE,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildNavigationCommandMenuItemOperationsOrThrow = ({
  existingFlatCommandMenuItemMaps,
  objectMetadatasForNavigation,
  applicationId,
  workspaceId,
  now,
  renamedCollisionObjectMetadatas,
}: {
  existingFlatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  objectMetadatasForNavigation: FlatObjectMetadata[];
  applicationId: string;
  workspaceId: string;
  now: string;
  renamedCollisionObjectMetadatas: {
    universalIdentifier: string;
    nameSingular: string;
  }[];
}): FlatEntityToCreateDeleteUpdate<'commandMenuItem'> => {
  const flatEntityToCreate: FlatCommandMenuItem[] = [];
  const flatEntityToUpdate: FlatCommandMenuItem[] = [];

  let nextPosition =
    Object.values(existingFlatCommandMenuItemMaps.byUniversalIdentifier)
      .filter(isDefined)
      .reduce(
        (maxPosition, commandMenuItem) =>
          Math.max(maxPosition, commandMenuItem.position),
        -1,
      ) + 1;

  for (const objectMetadata of objectMetadatasForNavigation) {
    const commandMenuItemUniversalIdentifier = v5(
      objectMetadata.universalIdentifier,
      NAVIGATION_COMMAND_UUID_NAMESPACE,
    );

    if (
      !objectMetadata.isActive ||
      isDefined(
        existingFlatCommandMenuItemMaps.byUniversalIdentifier[
          commandMenuItemUniversalIdentifier
        ],
      )
    ) {
      continue;
    }

    flatEntityToCreate.push(
      buildNavigationFlatCommandMenuItem({
        objectMetadata,
        commandMenuItemId: v4(),
        applicationId,
        workspaceId,
        position: nextPosition++,
        now,
      }),
    );
  }

  for (const renamedCollisionObjectMetadata of renamedCollisionObjectMetadatas) {
    const renamedNavigationCommandMenuItemUniversalIdentifier = v5(
      renamedCollisionObjectMetadata.universalIdentifier,
      NAVIGATION_COMMAND_UUID_NAMESPACE,
    );
    const staleNavigationCommandMenuItem =
      existingFlatCommandMenuItemMaps.byUniversalIdentifier[
        renamedNavigationCommandMenuItemUniversalIdentifier
      ];

    if (isDefined(staleNavigationCommandMenuItem)) {
      flatEntityToUpdate.push({
        ...staleNavigationCommandMenuItem,
        conditionalAvailabilityExpression:
          buildNavigationConditionalAvailabilityExpression({
            universalIdentifier:
              renamedCollisionObjectMetadata.universalIdentifier,
            nameSingular: renamedCollisionObjectMetadata.nameSingular,
          }),
        updatedAt: now,
      });
    }
  }

  return { flatEntityToCreate, flatEntityToDelete: [], flatEntityToUpdate };
};
