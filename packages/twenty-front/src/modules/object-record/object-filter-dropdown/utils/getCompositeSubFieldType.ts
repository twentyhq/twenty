import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getCompositeSubFieldType = (
  fieldMetadataItem: FieldMetadataItem,
  subFieldName: string,
): FieldMetadataType | null => {
  const compositeType = compositeTypeDefinitions.get(fieldMetadataItem.type);

  if (!isDefined(compositeType)) {
    return null;
  }

  const subFieldProperty = compositeType.properties.find(
    (property) => property.name === subFieldName,
  );

  return subFieldProperty?.type ?? null;
};
