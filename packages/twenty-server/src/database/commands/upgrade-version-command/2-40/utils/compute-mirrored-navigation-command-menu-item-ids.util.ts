import { isDefined } from 'twenty-shared/utils';

import { resolveBackfilledFlatEntityIsActive } from 'src/database/commands/upgrade-version-command/2-40/utils/resolve-backfilled-flat-entity-is-active.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

// The engine keeps an object's navigation command in step with the object:
// a false on the command of an inactive object is that mirror, not a
// deactivation the workspace wrote, and stays on the column where the
// on-update side effect will flip it back with the object.
export const computeMirroredNavigationCommandMenuItemIds = ({
  flatCommandMenuItemMaps,
  flatObjectMetadataMaps,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatCommandMenuItemMaps: AllFlatEntityMaps['flatCommandMenuItemMaps'];
  flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  workspaceCustomApplicationUniversalIdentifier: string;
}): Set<string> => {
  const mirroredIds = new Set<string>();

  for (const flatCommandMenuItem of Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(flatCommandMenuItem) ||
      !flatCommandMenuItem.isSystemSideEffect ||
      flatCommandMenuItem.engineComponentKey !==
        EngineComponentKey.NAVIGATION ||
      !isDefined(flatCommandMenuItem.navigationTargetObjectMetadataId)
    ) {
      continue;
    }

    const objectUniversalIdentifier =
      flatObjectMetadataMaps.universalIdentifierById[
        flatCommandMenuItem.navigationTargetObjectMetadataId
      ];
    const flatObjectMetadata = isDefined(objectUniversalIdentifier)
      ? flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier]
      : undefined;

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const isObjectActive = resolveBackfilledFlatEntityIsActive({
      metadataName: 'objectMetadata',
      flatEntity: flatObjectMetadata,
      workspaceCustomApplicationUniversalIdentifier,
    });

    if (!isObjectActive) {
      mirroredIds.add(flatCommandMenuItem.id);
    }
  }

  return mirroredIds;
};
