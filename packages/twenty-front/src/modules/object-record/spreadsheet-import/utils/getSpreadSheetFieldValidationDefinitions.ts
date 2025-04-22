import { SpreadsheetImportFieldValidationDefinition } from '@/spreadsheet-import/types';
import { absoluteUrlSchema, isDefined, isValidUuid } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getSpreadSheetFieldValidationDefinitions = (
  type: FieldMetadataType,
  fieldName: string,
): SpreadsheetImportFieldValidationDefinition[] => {
  switch (type) {
    case FieldMetadataType.FULL_NAME:
      return [
        {
          rule: 'object',
          isValid: ({
            firstName,
            lastName,
          }: {
            firstName: string;
            lastName: string;
          }) => {
            return (
              isDefined(firstName) &&
              isDefined(lastName) &&
              typeof firstName === 'string' &&
              typeof lastName === 'string'
            );
          },
          errorMessage: fieldName + ' must be a full name',
          level: 'error',
        },
      ];
    case FieldMetadataType.NUMBER:
      return [
        {
          rule: 'function',
          isValid: (value: string) => !isNaN(+value),
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    case FieldMetadataType.RELATION:
      return [
        {
          rule: 'function',
          isValid: (value: string) => isValidUuid(value),
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    case FieldMetadataType.LINKS:
      return [
        {
          rule: 'function',
          isValid: (value: string) =>
            absoluteUrlSchema.safeParse(value).success,
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    default:
      return [];
  }
};
