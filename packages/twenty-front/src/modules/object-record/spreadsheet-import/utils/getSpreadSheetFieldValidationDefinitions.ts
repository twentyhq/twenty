import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { SpreadsheetImportFieldValidationDefinition } from '@/spreadsheet-import/types';
import { isString, isDate } from '@sniptt/guards';
import { absoluteUrlSchema, isDefined, isValidUuid } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const getNumberValidationDefinition = (
  fieldName: string,
): SpreadsheetImportFieldValidationDefinition => ({
  rule: 'function',
  isValid: (value: string) => !isNaN(+value),
  errorMessage: fieldName + ' must be a number',
  level: 'error',
});

export const getSpreadSheetFieldValidationDefinitions = (
  type: FieldMetadataType,
  fieldName: string,
  subFieldKey?: string,
): SpreadsheetImportFieldValidationDefinition[] => {
  switch (type) {
    case FieldMetadataType.NUMBER:
      return [getNumberValidationDefinition(fieldName)];
    case FieldMetadataType.UUID:
    case FieldMetadataType.RELATION:
      return [
        {
          rule: 'function',
          isValid: (value: string) => isValidUuid(value),
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    case FieldMetadataType.CURRENCY:
      switch (subFieldKey) {
        case 'amountMicrosLabel':
          return [getNumberValidationDefinition(fieldName)];
        default:
          return [];
      }
    case FieldMetadataType.EMAILS:
      switch (subFieldKey) {
        case 'primaryEmailLabel':
          return [
            {
              rule: 'function',
              isValid: (email: string) => emailSchema.safeParse(email).success,
              errorMessage: fieldName + ' is not valid email',
              level: 'error',
            },
          ];
        case 'additionalEmailsLabel':
          return [
            {
              rule: 'function',
              isValid: (stringifiedAdditionalEmails: string) => {
                if (!isDefined(stringifiedAdditionalEmails)) return true;
                try {
                  const additionalEmails = JSON.parse(
                    stringifiedAdditionalEmails,
                  );
                  return additionalEmails.every(
                    (email: string) => emailSchema.safeParse(email).success,
                  );
                } catch {
                  return false;
                }
              },
              errorMessage: fieldName + ' must be an array of valid emails',
              level: 'error',
            },
          ];
        default:
          return [];
      }
    case FieldMetadataType.LINKS:
      switch (subFieldKey) {
        case 'primaryLinkUrlLabel':
          return [
            {
              rule: 'function',
              isValid: (primaryLinkUrl: string) => {
                if (!isDefined(primaryLinkUrl)) return true;
                return absoluteUrlSchema.safeParse(primaryLinkUrl).success;
              },
              errorMessage: fieldName + ' is not valid URL',
              level: 'error',
            },
          ];
        case 'secondaryLinksLabel':
          return [
            {
              rule: 'function',
              isValid: (stringifiedSecondaryLinks: string) => {
                if (!isDefined(stringifiedSecondaryLinks)) return true;
                try {
                  const secondaryLinks = JSON.parse(stringifiedSecondaryLinks);
                  return secondaryLinks.every((link: { url: string }) => {
                    if (!isDefined(link.url)) return true;
                    return absoluteUrlSchema.safeParse(link.url).success;
                  });
                } catch {
                  return false;
                }
              },
              errorMessage:
                fieldName +
                ' must be an array of object with valid url and label ({url: string|null, label: string|null})',
              level: 'error',
            },
          ];
        default:
          return [];
      }

    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
      return [
        {
          rule: 'function',
          isValid: (value: string) => {
            const date = new Date(value);
            return isDate(date) && !isNaN(date.getTime());
          },
          errorMessage: fieldName + ' is not valid date',
          level: 'error',
        },
      ];
    case FieldMetadataType.PHONES:
      switch (subFieldKey) {
        case 'primaryPhoneNumberLabel':
          return [
            {
              rule: 'regex',
              value: '^[0-9]+$',
              errorMessage: fieldName + ' must contain only numbers',
              level: 'error',
            },
          ];
        case 'additionalPhonesLabel':
          return [
            {
              rule: 'function',
              isValid: (stringifiedAdditionalPhones: string) => {
                if (!isDefined(stringifiedAdditionalPhones)) return true;
                try {
                  const additionalPhones = JSON.parse(
                    stringifiedAdditionalPhones,
                  );
                  return additionalPhones.every(
                    (phone: {
                      number: string;
                      callingCode: string;
                      countryCode: string;
                    }) =>
                      isDefined(phone.number) &&
                      /^[0-9]+$/.test(phone.number) &&
                      isDefined(phone.callingCode) &&
                      isDefined(phone.countryCode),
                  );
                } catch {
                  return false;
                }
              },
              errorMessage:
                fieldName +
                ' must be an array of object with valid phone, calling code and country code ({number: string, callingCode: string, countryCode: string})',
              level: 'error',
            },
          ];
        default:
          return [];
      }
    case FieldMetadataType.RAW_JSON:
      return [
        {
          rule: 'function',
          isValid: (value: string) => {
            try {
              JSON.parse(value);
              return true;
            } catch {
              return false;
            }
          },
          errorMessage: fieldName + ' is not valid JSON',
          level: 'error',
        },
      ];
    case FieldMetadataType.ARRAY:
      return [
        {
          rule: 'function',
          isValid: (value: string) => {
            try {
              const parsedValue = JSON.parse(value);
              return (
                Array.isArray(parsedValue) &&
                parsedValue.every((item: any) => isString(item))
              );
            } catch {
              return false;
            }
          },
          errorMessage: fieldName + ' is not valid array',
          level: 'error',
        },
      ];
    default:
      return [];
  }
};
