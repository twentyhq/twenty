import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const isOwnManifestLogicFunction = ({
  universalIdentifier,
  fromFlatLogicFunctionMaps,
  toFlatLogicFunctionMaps,
  inferDeletionFromMissingEntities,
}: {
  universalIdentifier: string;
  fromFlatLogicFunctionMaps: UniversalFlatEntityMaps<SyncableFlatEntity>;
  toFlatLogicFunctionMaps: UniversalFlatEntityMaps<SyncableFlatEntity>;
  inferDeletionFromMissingEntities: boolean;
}): boolean =>
  isDefined(
    findFlatEntityByUniversalIdentifier({
      flatEntityMaps: toFlatLogicFunctionMaps,
      universalIdentifier,
    }),
  ) ||
  // fromFlatLogicFunctionMaps only holds this application's functions, which a partial sync keeps.
  (!inferDeletionFromMissingEntities &&
    isDefined(
      findFlatEntityByUniversalIdentifier({
        flatEntityMaps: fromFlatLogicFunctionMaps,
        universalIdentifier,
      }),
    ));
