import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

const EXCLUDED_SYSTEM_FIELDS = ['searchVector', 'position'];

const isActiveField = (field: FlatFieldMetadata) => {
  return field.isActive;
};

const isExcludedSystemField = (field: FlatFieldMetadata) => {
  return field.isSystem && EXCLUDED_SYSTEM_FIELDS.includes(field.name);
};

const isManyToOneRelationField = (field: FlatFieldMetadata) => {
  if (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION)) {
    return field.settings?.relationType === RelationType.MANY_TO_ONE;
  }

  return false;
};

const isExcludedRelationField = (field: FlatFieldMetadata) => {
  return (
    isMorphOrRelationFlatFieldMetadata(field) &&
    !isManyToOneRelationField(field)
  );
};

export const shouldGenerateFieldFakeValue = (field: FlatFieldMetadata) => {
  return (
    isActiveField(field) &&
    !isExcludedSystemField(field) &&
    !isExcludedRelationField(field)
  );
};
