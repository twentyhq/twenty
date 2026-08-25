import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isLegacyObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-legacy-object-metadata-command-menu-item-payload.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export type ObjectNavigationPayloadRewrite = {
  flatCommandMenuItemsToUpdate: FlatCommandMenuItem[];
  flatCommandMenuItemsWithoutTarget: FlatCommandMenuItem[];
};

export const computeObjectNavigationPayloadRewrite = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  now: string;
}): ObjectNavigationPayloadRewrite => {
  const rewrite: ObjectNavigationPayloadRewrite = {
    flatCommandMenuItemsToUpdate: [],
    flatCommandMenuItemsWithoutTarget: [],
  };

  for (const flatCommandMenuItem of Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      flatCommandMenuItem.engineComponentKey !== EngineComponentKey.NAVIGATION ||
      !isLegacyObjectMetadataCommandMenuItemPayload(flatCommandMenuItem.payload)
    ) {
      continue;
    }

    // The payload is the only place the target still lives, dropping it
    // would leave the command pointing nowhere
    if (!isDefined(flatCommandMenuItem.navigationTargetObjectMetadataId)) {
      rewrite.flatCommandMenuItemsWithoutTarget.push(flatCommandMenuItem);
      continue;
    }

    rewrite.flatCommandMenuItemsToUpdate.push({
      ...flatCommandMenuItem,
      payload: null,
      updatedAt: now,
    });
  }

  return rewrite;
};
