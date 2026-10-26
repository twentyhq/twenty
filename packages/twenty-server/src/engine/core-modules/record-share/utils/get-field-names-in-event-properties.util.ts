import { RelationType } from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const getFieldNamesInEventProperties = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): string[] => {
  if (
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
    flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
  ) {
    return [flatFieldMetadata.name];
  }

  // The owning side of a relation also travels as its join column: the record
  // snapshots carry the ORM spelling, which settings can rename, while
  // computeUpdatedFieldsFromDiff always appends <name>Id.
  return [
    flatFieldMetadata.name,
    getJoinColumnNameForRelationField(flatFieldMetadata),
    computeMorphOrRelationFieldJoinColumnName({
      name: flatFieldMetadata.name,
    }),
  ];
};
