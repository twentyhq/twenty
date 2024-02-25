import { isValidPhoneNumber } from 'libphonenumber-js';

import { isValidUuid } from '@/object-record/spreadsheet-import/util/isValidUuid';
import { Validation } from '@/spreadsheet-import/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getSpreadSheetValidation = (
  type: FieldMetadataType,
  fieldName: string,
): Validation[] => {
  switch (type) {
    case FieldMetadataType.Number:
      return [
        {
          rule: 'regex',
          value: '^\\d+$',
          errorMessage: fieldName + ' must be a number',
          level: 'error',
        },
      ];
    case FieldMetadataType.Phone:
      return [
        {
          rule: 'function',
          isValid: (value: string) => isValidPhoneNumber(value),
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    case FieldMetadataType.Relation:
      return [
        {
          rule: 'function',
          isValid: (value: string) => isValidUuid(value),
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    default:
      return [];
  }
};
