import { MAX_RECORD_PERMISSION_INHERITANCE_DEPTH } from 'twenty-shared/constants';
import { type RecordPermissionInheritancePath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type RecordPermissionMetadata,
  type ResolvedRecordPermissionPathHop,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const resolveRecordPermissionPath = ({
  path,
  targetObjectUniversalIdentifier,
  metadata,
}: {
  path: RecordPermissionInheritancePath;
  targetObjectUniversalIdentifier: string;
  metadata: RecordPermissionMetadata;
}): ResolvedRecordPermissionPathHop[] => {
  if (
    path.fieldUniversalIdentifiers.length === 0 ||
    path.fieldUniversalIdentifiers.length >
      MAX_RECORD_PERMISSION_INHERITANCE_DEPTH
  ) {
    throw new Error(
      'An inheritance path must have between one and three relation fields',
    );
  }

  let sourceObject =
    metadata.flatObjectMetadataMaps.byUniversalIdentifier[
      path.sourceObjectUniversalIdentifier
    ];
  const visited = new Set([path.sourceObjectUniversalIdentifier]);
  const hops: ResolvedRecordPermissionPathHop[] = [];

  for (const fieldUniversalIdentifier of path.fieldUniversalIdentifiers) {
    const field =
      metadata.flatFieldMetadataMaps.byUniversalIdentifier[
        fieldUniversalIdentifier
      ];

    if (
      !isDefined(sourceObject) ||
      !isDefined(field) ||
      !isMorphOrRelationFlatFieldMetadata(field) ||
      field.objectMetadataId !== sourceObject.id
    ) {
      throw new Error(
        'Inheritance paths must follow connected relation fields',
      );
    }

    const targetObject = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: field.relationTargetObjectMetadataId,
      flatEntityMaps: metadata.flatObjectMetadataMaps,
    });

    if (
      !isDefined(targetObject) ||
      visited.has(targetObject.universalIdentifier)
    ) {
      throw new Error(
        'Inheritance paths cannot contain cycles or missing objects',
      );
    }

    const isManyToOne =
      field.settings.relationType === RelationType.MANY_TO_ONE;
    const inverseField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: field.relationTargetFieldMetadataId,
      flatEntityMaps: metadata.flatFieldMetadataMaps,
    });

    if (
      !isManyToOne &&
      (field.settings.relationType !== RelationType.ONE_TO_MANY ||
        !isDefined(inverseField) ||
        !isMorphOrRelationFlatFieldMetadata(inverseField) ||
        inverseField.settings.relationType !== RelationType.MANY_TO_ONE ||
        inverseField.objectMetadataId !== targetObject.id)
    ) {
      throw new Error('Inheritance requires a concrete owning relation');
    }

    hops.push({
      sourceObject,
      targetObject,
      fieldUniversalIdentifier,
      sourceColumn: isManyToOne
        ? computeMorphOrRelationFieldJoinColumnName({ name: field.name })
        : 'id',
      targetColumn: isManyToOne
        ? 'id'
        : computeMorphOrRelationFieldJoinColumnName({
            name: inverseField!.name,
          }),
    });
    visited.add(targetObject.universalIdentifier);
    sourceObject = targetObject;
  }

  if (sourceObject?.universalIdentifier !== targetObjectUniversalIdentifier) {
    throw new Error(
      'Inheritance path does not end at the configured target object',
    );
  }

  return hops;
};
