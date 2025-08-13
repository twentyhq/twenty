import { type FieldType } from '@/settings/data-model/types/FieldType';
import { FieldMetadataType } from 'twenty-shared/types';

// TODO: see why RELATION is considered as a non composite type in settings, because it prevents this function
// to be a typeguard
export const isNonCompositeField = (type: FieldType) => {
  const fieldIsSimpleValue = [
    FieldMetadataType.UUID,
    FieldMetadataType.TEXT,
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
    FieldMetadataType.NUMBER,
    FieldMetadataType.NUMERIC,
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.RATING,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.POSITION,
    FieldMetadataType.RAW_JSON,
    FieldMetadataType.RICH_TEXT,
    FieldMetadataType.ARRAY,
  ].includes(type as any);

  return fieldIsSimpleValue;
};
