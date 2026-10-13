import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationGroup,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildMorphRelationGroupFromTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-morph-relation-group-from-target.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isRelationFieldMetadataWithTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-field-metadata-with-target.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type SkippedMorphFieldGroup = {
  morphId: string;
  reason: string;
};

export const buildMorphFieldGroups = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  standardFlatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  standardFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  groupsToCreate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  skippedGroups: SkippedMorphFieldGroup[];
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
      !isMorphRelationGroup(flatFieldMetadata) &&
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

  const groupsToCreate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] =
    [];
  const skippedGroups: SkippedMorphFieldGroup[] = [];

  for (const [morphId, targets] of targetsByMorphId) {
    if (new Set(targets.map((target) => target.objectMetadataId)).size > 1) {
      skippedGroups.push({
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
      skippedGroups.push({
        morphId,
        reason: 'representative target has no relation target',
      });
      continue;
    }

    const standardGroup =
      standardFlatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const group = {
      ...buildMorphRelationGroupFromTarget({
        target: survivor,
        targetObject,
        inverse: findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: survivor.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      }),
      ...(isDefined(standardGroup) && {
        name: standardGroup.name,
        label: standardGroup.label,
        description: standardGroup.description,
        icon: standardGroup.icon,
        isUIEditable: standardGroup.isUIEditable,
      }),
      id: v4(),
    };
    const fieldNameKey = `${group.objectMetadataId}:${group.name}`;

    if (usedFieldNames.has(fieldNameKey)) {
      skippedGroups.push({
        morphId,
        reason: `name "${group.name}" is already used on the object`,
      });
      continue;
    }

    usedFieldNames.add(fieldNameKey);
    groupsToCreate.push(group);
  }

  return { groupsToCreate, skippedGroups };
};
