import { isFieldRatingValue } from '@/object-record/record-field/ui/types/guards/isFieldRatingValue';
import { emailSchema } from '@/object-record/record-field/ui/validation-schemas/emailSchema';
import { type SpreadsheetImportFieldValidationDefinition } from '@/spreadsheet-import/types';
import { t } from '@lingui/core/macro';
import { isDate, isString } from '@sniptt/guards';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { RATING_VALUES } from 'twenty-shared/constants';
import {
  absoluteUrlSchema,
  getCountryCodesForCallingCode,
  isDefined,
  isValidCountryCode,
  isValidUuid,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const getNumberValidationDefinition = (
  fieldName: string,
): SpreadsheetImportFieldValidationDefinition => ({
  rule: 'function',
  isValid: (value: string) => !isNaN(+value),
  errorMessage: `${fieldName} ${t`must be a number`}`,
  level: 'error',
});

const isValidPhoneNumber = (value: string) => {
  try {
    return isDefined(
      parsePhoneNumberWithError(value, { defaultCallingCode: '1' }),
    );
  } catch {
    return false;
  }
};

const isValidCallingCode = (value: string) => {
  return getCountryCodesForCallingCode(value).length > 0;
};

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
          errorMessage: `${fieldName} ${t`is not a valid UUID`}`,
          level: 'error',
        },
      ];
    case FieldMetadataType.CURRENCY:
      switch (subFieldKey) {
        case 'amountMicros':
          return [getNumberValidationDefinition(fieldName)];
        default:
          return [];
      }
    case FieldMetadataType.EMAILS:
      switch (subFieldKey) {
        case 'primaryEmail':
          return [
            {
              rule: 'function',
              isValid: (email: string) => emailSchema.safeParse(email).success,
              errorMessage: `${fieldName} ${t`is not a valid email`}`,
              level: 'error',
            },
          ];
        case 'additionalEmails':
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
              errorMessage: `${fieldName} ${t`must be an array of valid emails`}`,
              level: 'error',
            },
          ];
        default:
          return [];
      }
    case FieldMetadataType.LINKS:
      switch (subFieldKey) {
        case 'primaryLinkUrl':
          return [
            {
              rule: 'function',
              isValid: (primaryLinkUrl: string) => {
                if (!isDefined(primaryLinkUrl)) return true;
                return absoluteUrlSchema.safeParse(primaryLinkUrl).success;
              },
              errorMessage: `${fieldName} ${t`is not a valid URL`}`,
              level: 'error',
            },
          ];
        case 'secondaryLinks':
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
              errorMessage: `${fieldName} ${t`must be an array of object with valid url and label (format: '[{"url":"valid.url", "label":"label value")}]'`}`,
              level: 'error',
            },
          ];
        default:
          return [];
      }

    case FieldMetadataType.DATE_TIME:
      return [
        {
          rule: 'function',
          isValid: (value: string) => {
            const date = new Date(value);
            return isDate(date) && !isNaN(date.getTime());
          },
          errorMessage: `${fieldName} ${t`is not a valid date time (format: '2021-12-01T00:00:00Z')`}`,
          level: 'error',
        },
      ];
    case FieldMetadataType.DATE:
      return [
        {
          rule: 'function',
          isValid: (value: string) => {
            const date = new Date(value);
            return isDate(date) && !isNaN(date.getTime());
          },
          errorMessage: `${fieldName} ${t`is not a valid date (format: '2021-12-01')`}`,
          level: 'error',
        },
      ];
    case FieldMetadataType.PHONES:
      switch (subFieldKey) {
        case 'primaryPhoneNumber':
          return [
            {
              rule: 'function',
              isValid: isValidPhoneNumber,
              errorMessage: `${fieldName} ${t`is not a valid phone number`}`,
              level: 'error',
            },
          ];
        case 'primaryPhoneCallingCode':
          return [
            {
              rule: 'function',
              isValid: isValidCallingCode,
              errorMessage: `${fieldName} ${t`is not a valid calling code`}`,
              level: 'error',
            },
          ];
        case 'primaryPhoneCountryCode':
          return [
            {
              rule: 'function',
              isValid: isValidCountryCode,
              errorMessage: `${fieldName} ${t`is not a valid country code`}`,
              level: 'error',
            },
          ];
        case 'additionalPhones':
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
                      isValidPhoneNumber(phone.number) &&
                      isValidCallingCode(phone.callingCode) &&
                      isValidCountryCode(phone.countryCode),
                  );
                } catch {
                  return false;
                }
              },
              errorMessage: `${fieldName} ${t`must be an array of object with valid phone, calling code and country code (format: '[{"number":"123456789", "callingCode":"+33", "countryCode":"FR"}]')`}`,
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
          errorMessage: `${fieldName} ${t`is not a valid JSON`}`,
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
          errorMessage: `${fieldName} ${t`is not a valid array`}`,
          level: 'error',
        },
      ];
    case FieldMetadataType.RATING: {
      const ratingValues = RATING_VALUES.join(', ');

      return [
        {
          rule: 'function',
          isValid: isFieldRatingValue,
          errorMessage: `${fieldName} ${t` must be one of ${ratingValues} values`}`,
          level: 'error',
        },
      ];
    }
    default:
      return [];
  }
};
