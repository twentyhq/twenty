import { FieldValidationDefinition } from '@/spreadsheet-import/types';
import { isDefined } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isValidUuid } from '~/utils/isValidUuid';
import { absoluteUrlSchema } from '~/utils/validation-schemas/absoluteUrlSchema';

export const getSpreadSheetFieldValidationDefinitions = (
  type: FieldMetadataType,
  fieldName: string,
): FieldValidationDefinition[] => {
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
