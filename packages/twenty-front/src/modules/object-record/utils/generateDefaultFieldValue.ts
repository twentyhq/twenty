import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { v4 } from 'uuid';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const generateDefaultFieldValue = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue' | 'type'>,
) => {
  const defaultValue = isFieldValueEmpty({
    fieldValue: fieldMetadataItem.defaultValue,
    fieldDefinition: fieldMetadataItem,
  })
    ? generateEmptyFieldValue(fieldMetadataItem)
    : stripSimpleQuotesFromString(fieldMetadataItem.defaultValue);

  switch (defaultValue) {
    case 'uuid':
      return v4();
    case 'now':
      return new Date().toISOString();
    default:
      return defaultValue;
  }
};
