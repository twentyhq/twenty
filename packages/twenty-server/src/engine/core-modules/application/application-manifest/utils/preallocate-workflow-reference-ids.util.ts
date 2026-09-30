import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';

const preallocateIds = ({
  toByUniversalIdentifier,
  fromByUniversalIdentifier,
}: {
  toByUniversalIdentifier: Partial<Record<string, unknown>>;
  fromByUniversalIdentifier: Partial<Record<string, { id: string }>>;
}): Record<string, string> => {
  return Object.fromEntries(
    Object.keys(toByUniversalIdentifier).map((universalIdentifier) => [
      universalIdentifier,
      fromByUniversalIdentifier[universalIdentifier]?.id ?? v4(),
    ]),
  );
};

export const preallocateWorkflowReferenceIds = ({
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
}: {
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
}): IdByUniversalIdentifierByMetadataName => {
  return {
    logicFunction: preallocateIds({
      toByUniversalIdentifier:
        toAllUniversalFlatEntityMaps.flatLogicFunctionMaps
          .byUniversalIdentifier,
      fromByUniversalIdentifier:
        fromAllFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier,
    }),
    agent: preallocateIds({
      toByUniversalIdentifier:
        toAllUniversalFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
      fromByUniversalIdentifier:
        fromAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier,
    }),
    fieldMetadata: preallocateIds({
      toByUniversalIdentifier:
        toAllUniversalFlatEntityMaps.flatFieldMetadataMaps
          .byUniversalIdentifier,
      fromByUniversalIdentifier:
        fromAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    }),
  };
};
