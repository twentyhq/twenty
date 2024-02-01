import { isValidPhoneNumber } from 'libphonenumber-js';

import { Validation } from '@/spreadsheet-import/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getSpreadSheetValidation = (
  type: FieldMetadataType,
  fieldName: string,
): Validation[] => {
  // TODO validate Relation Ids?
  switch (type) {
    case FieldMetadataType.Number:
      return [
        {
          rule: 'regex',
          value: '^d+$',
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
    default:
      return [];
  }
};
