import { isFieldMetadataSupportedInGroupBy } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

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

  return isFieldMetadataSupportedInGroupBy(nestedFieldMetadata);
};
