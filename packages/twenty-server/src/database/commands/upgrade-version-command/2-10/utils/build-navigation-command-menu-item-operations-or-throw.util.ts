import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  buildLegacyNavigationFlatCommandMenuItem,
  getLegacyNavigationCommandUniversalIdentifier,
} from 'src/database/commands/upgrade-version-command/utils/build-legacy-navigation-flat-command-menu-item.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
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
    const commandMenuItemUniversalIdentifier =
      getLegacyNavigationCommandUniversalIdentifier(
        objectMetadata.universalIdentifier,
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
      buildLegacyNavigationFlatCommandMenuItem({
        objectMetadata,
        commandMenuItemId: v4(),
        applicationId,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId,
        position: nextPosition++,
        now,
      }),
    );
  }

  for (const renamedCollisionObjectMetadata of renamedCollisionObjectMetadatas) {
    const renamedNavigationCommandMenuItemUniversalIdentifier =
      getLegacyNavigationCommandUniversalIdentifier(
        renamedCollisionObjectMetadata.universalIdentifier,
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
