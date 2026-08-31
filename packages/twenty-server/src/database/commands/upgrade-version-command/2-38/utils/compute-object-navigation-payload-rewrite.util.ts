import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ObjectNavigationPayloadRewrite = {
  flatCommandMenuItemsToUpdate: FlatCommandMenuItem[];
  flatCommandMenuItemsToDelete: FlatCommandMenuItem[];
};

// Rewrites legacy { objectMetadataItemId } navigation payloads to
// { path: null }: the target now lives solely in
// navigationTargetObjectMetadataId, backfilled by the 2-35 command. Rows the
// 2-35 backfill could not reach (created legacy mid-upgrade) get their target
// derived here the same way, and orphans pointing at a missing object are
// deleted for the same reason 2-35 deleted them.
export const computeObjectNavigationPayloadRewrite = ({
  flatCommandMenuItemMaps,
  flatObjectMetadataMaps,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  now: string;
}): ObjectNavigationPayloadRewrite => {
  const rewrite: ObjectNavigationPayloadRewrite = {
    flatCommandMenuItemsToUpdate: [],
    flatCommandMenuItemsToDelete: [],
  };

  for (const flatCommandMenuItem of Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      flatCommandMenuItem.engineComponentKey !==
        EngineComponentKey.NAVIGATION ||
      !isObjectMetadataCommandMenuItemPayload(flatCommandMenuItem.payload)
    ) {
      continue;
    }

    if (isDefined(flatCommandMenuItem.navigationTargetObjectMetadataId)) {
      rewrite.flatCommandMenuItemsToUpdate.push({
        ...flatCommandMenuItem,
        payload: { path: null },
        updatedAt: now,
      });
      continue;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatCommandMenuItem.payload.objectMetadataItemId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      rewrite.flatCommandMenuItemsToDelete.push(flatCommandMenuItem);
      continue;
    }

    rewrite.flatCommandMenuItemsToUpdate.push({
      ...flatCommandMenuItem,
      payload: { path: null },
      navigationTargetObjectMetadataId: flatObjectMetadata.id,
      navigationTargetObjectMetadataUniversalIdentifier:
        flatObjectMetadata.universalIdentifier,
      updatedAt: now,
    });
  }

  return rewrite;
};
