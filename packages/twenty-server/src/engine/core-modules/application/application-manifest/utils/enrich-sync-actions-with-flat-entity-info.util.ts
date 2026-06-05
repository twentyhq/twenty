import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

// Create actions already carry their flatEntity, but update and delete actions
// only carry a universalIdentifier. This attaches the entity (resolved from the
// manifest for updates, from the existing workspace slice for deletes) so the
// CLI can render a human-readable label for every operation, not just creates.
export const enrichSyncActionsWithFlatEntityInfo = ({
  actions,
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  actions: AllUniversalWorkspaceMigrationAction[];
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
}): AllUniversalWorkspaceMigrationAction[] =>
  actions.map((action) => {
    if (action.type === 'create') {
      return action;
    }

    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(action.metadataName);
    const sourceAllFlatEntityMaps =
      action.type === 'delete'
        ? fromAllFlatEntityMaps
        : toAllUniversalFlatEntityMaps;

    const flatEntity =
      sourceAllFlatEntityMaps[flatEntityMapsKey].byUniversalIdentifier[
        action.universalIdentifier
      ];

    if (!isDefined(flatEntity)) {
      return action;
    }

    return {
      ...action,
      flatEntity,
    } as unknown as AllUniversalWorkspaceMigrationAction;
  });
