import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
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
  const reservedSystemFieldsOfNewObjects = Object.fromEntries(
    Object.values(
      toAllUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (object) =>
          !isDefined(
            fromAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
              object.universalIdentifier
            ],
          ),
      )
      .flatMap((object) =>
        Object.values(
          buildReservedSystemFlatFieldMetadatasForCustomObject({
            flatObjectMetadata: object,
          }),
        ),
      )
      .map((field) => [field.universalIdentifier, field]),
  );

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
    objectMetadata: preallocateIds({
      toByUniversalIdentifier:
        toAllUniversalFlatEntityMaps.flatObjectMetadataMaps
          .byUniversalIdentifier,
      fromByUniversalIdentifier:
        fromAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    }),
    fieldMetadata: preallocateIds({
      toByUniversalIdentifier: {
        ...reservedSystemFieldsOfNewObjects,
        ...toAllUniversalFlatEntityMaps.flatFieldMetadataMaps
          .byUniversalIdentifier,
      },
      fromByUniversalIdentifier:
        fromAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    }),
  };
};
