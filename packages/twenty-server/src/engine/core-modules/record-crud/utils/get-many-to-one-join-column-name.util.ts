import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

export const getManyToOneJoinColumnName = (
  field: FlatFieldMetadata,
): string | undefined =>
  isMorphOrRelationFlatFieldMetadata(field) &&
  isManyToOneFlatFieldMetadata(field)
    ? computeMorphOrRelationFieldJoinColumnName({ name: field.name })
    : undefined;
