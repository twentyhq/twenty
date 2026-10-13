import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildMorphRelationHeadFromTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-morph-relation-head-from-target.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isRelationFieldMetadataWithTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-field-metadata-with-target.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type SkippedMorphRelationHead = {
  morphId: string;
  reason: string;
};

export const buildMorphRelationHeads = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  standardFlatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  standardFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  headsToCreate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  skippedHeads: SkippedMorphRelationHead[];
} => {
  const allFlatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const targetsByMorphId = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();

  for (const flatFieldMetadata of allFlatFieldMetadatas) {
    if (
      isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) &&
      !isMorphRelationHead(flatFieldMetadata) &&
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[flatFieldMetadata.morphId],
      )
    ) {
      targetsByMorphId.set(flatFieldMetadata.morphId, [
        ...(targetsByMorphId.get(flatFieldMetadata.morphId) ?? []),
        flatFieldMetadata,
      ]);
    }
  }

  const usedFieldNames = new Set(
    allFlatFieldMetadatas.map(
      ({ objectMetadataId, name }) => `${objectMetadataId}:${name}`,
    ),
  );

  const headsToCreate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] =
    [];
  const skippedHeads: SkippedMorphRelationHead[] = [];

  for (const [morphId, targets] of targetsByMorphId) {
    if (new Set(targets.map((target) => target.objectMetadataId)).size > 1) {
      skippedHeads.push({
        morphId,
        reason: 'morph id is shared by fields on several objects',
      });
      continue;
    }

    const survivor = pickMorphGroupSurvivorOrThrow(targets);
    const targetObject = isRelationFieldMetadataWithTarget(survivor)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: survivor.relationTargetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isRelationFieldMetadataWithTarget(survivor) || !isDefined(targetObject)) {
      skippedHeads.push({
        morphId,
        reason: 'representative target has no relation target',
      });
      continue;
    }

    const standardHead =
      standardFlatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const head = {
      ...buildMorphRelationHeadFromTarget({
        target: survivor,
        targetObject,
        inverse: findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: survivor.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      }),
      ...(isDefined(standardHead) && {
        name: standardHead.name,
        label: standardHead.label,
        description: standardHead.description,
        icon: standardHead.icon,
        isUIEditable: standardHead.isUIEditable,
      }),
      id: v4(),
    };
    const fieldNameKey = `${head.objectMetadataId}:${head.name}`;

    if (usedFieldNames.has(fieldNameKey)) {
      skippedHeads.push({
        morphId,
        reason: `name "${head.name}" is already used on the object`,
      });
      continue;
    }

    usedFieldNames.add(fieldNameKey);
    headsToCreate.push(head);
  }

  return { headsToCreate, skippedHeads };
};
