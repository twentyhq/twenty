import { isFieldMetadataSupportedInGroupBy } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const isRelationNestedFieldSupportedInGroupBy = ({
  nestedFieldName,
  nestedFieldMetadata,
}: {
  nestedFieldName: string;
  nestedFieldMetadata: FlatFieldMetadata;
}): boolean => {
  if (nestedFieldName === 'id') {
    return true;
  }

  const relationType = isMorphOrRelationFlatFieldMetadata(nestedFieldMetadata)
    ? nestedFieldMetadata.settings.relationType
    : null;

  return isFieldMetadataSupportedInGroupBy({
    type: nestedFieldMetadata.type,
    name: nestedFieldMetadata.name,
    isSystem: nestedFieldMetadata.isSystem,
    relationType,
  });
};
