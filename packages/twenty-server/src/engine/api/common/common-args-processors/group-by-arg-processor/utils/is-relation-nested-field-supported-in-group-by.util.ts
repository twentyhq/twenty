import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataSupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-supported-in-group-by.util';

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

  return isFlatFieldMetadataSupportedInGroupBy(nestedFieldMetadata);
};
