import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getOptionalOrderByCasting = (
  fieldMetadata: Pick<FlatFieldMetadata, 'type'>,
): string => {
  if (
    fieldMetadata.type === FieldMetadataType.SELECT ||
    fieldMetadata.type === FieldMetadataType.MULTI_SELECT
  ) {
    return '::text';
  }

  return '';
};
