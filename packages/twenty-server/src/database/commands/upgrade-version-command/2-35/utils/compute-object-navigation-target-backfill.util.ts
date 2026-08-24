import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ObjectNavigationTargetBackfill = {
  flatCommandMenuItemsToUpdate: FlatCommandMenuItem[];
  orphanedCommandMenuItemIds: string[];
};

export const computeObjectNavigationTargetBackfill = ({
  flatCommandMenuItemMaps,
  flatObjectMetadataMaps,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  now: string;
}): ObjectNavigationTargetBackfill => {
  const backfill: ObjectNavigationTargetBackfill = {
    flatCommandMenuItemsToUpdate: [],
    orphanedCommandMenuItemIds: [],
  };

  for (const flatCommandMenuItem of Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      flatCommandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION ||
      isDefined(flatCommandMenuItem.targetObjectMetadataId) ||
      !isObjectMetadataCommandMenuItemPayload(flatCommandMenuItem.payload)
    ) {
      continue;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatCommandMenuItem.payload.objectMetadataItemId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      backfill.orphanedCommandMenuItemIds.push(flatCommandMenuItem.id);
      continue;
    }

    backfill.flatCommandMenuItemsToUpdate.push({
      ...flatCommandMenuItem,
      targetObjectMetadataId: flatObjectMetadata.id,
      targetObjectMetadataUniversalIdentifier:
        flatObjectMetadata.universalIdentifier,
      updatedAt: now,
    });
  }

  return backfill;
};
