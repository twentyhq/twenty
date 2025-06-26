import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldActorForInputValue } from '@/object-record/record-field/types/FieldMetadata';
import { getSubFieldOptionKey } from '@/object-record/spreadsheet-import/utils/getSubFieldOptionKey';
import { ImportedStructuredRow } from '@/spreadsheet-import/types';
import { isNonEmptyString } from '@sniptt/guards';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { castToString } from '~/utils/castToString';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { isEmptyObject } from '~/utils/isEmptyObject';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type BuildRecordFromImportedStructuredRowArgs = {
  importedStructuredRow: ImportedStructuredRow<any>;
  fields: FieldMetadataItem[];
};

const buildCompositeFieldRecord = (
  field: FieldMetadataItem,
  importedStructuredRow: ImportedStructuredRow<any>,
  compositeFieldConfig: Record<string, ((value: any) => any) | undefined>,
): Record<string, any> | undefined => {
  const compositeFieldRecord = Object.entries(compositeFieldConfig).reduce(
    (acc, [compositeFieldKey, transform]) => {
      const value =
        importedStructuredRow[getSubFieldOptionKey(field, compositeFieldKey)];

      return isDefined(value)
        ? { ...acc, [compositeFieldKey]: transform?.(value) || value }
        : acc;
    },
    {},
  );

  return isEmptyObject(compositeFieldRecord) ? undefined : compositeFieldRecord;
};

export const buildRecordFromImportedStructuredRow = ({
  fields,
  importedStructuredRow,
}: BuildRecordFromImportedStructuredRowArgs) => {
  const stringArrayJSONSchema = z
    .preprocess((value) => {
      try {
        if (typeof value !== 'string') {
          return [];
        }
        return JSON.parse(value);
      } catch {
        return [];
      }
    }, z.array(z.string()))
    .catch([]);

  const linkArrayJSONSchema = z
    .preprocess(
      (value) => {
        try {
          if (typeof value !== 'string') {
            return [];
          }
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      z.array(
        z.object({
          label: z.string().nullable(),
          url: z.string().nullable(),
        }),
      ),
    )
    .catch([]);

  const phoneArrayJSONSchema = z
    .preprocess(
      (value) => {
        try {
          if (typeof value !== 'string') {
            return [];
          }
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      z.array(
        z.object({
          number: z.string(),
          callingCode: z.string(),
          countryCode: z.string(),
        }),
      ),
    )
    .catch([]);

  const recordToBuild: Record<string, any> = {};

  const COMPOSITE_FIELD_TRANSFORM_CONFIGS = {
    [FieldMetadataType.CURRENCY]: {
      amountMicros: (value: any) =>
        convertCurrencyAmountToCurrencyMicros(Number(value)),
      currencyCode: undefined,
    },
    [FieldMetadataType.ADDRESS]: {
      addressStreet1: castToString,
    },
    addressStreet2: castToString,
    addressCity: castToString,
    addressPostcode: castToString,
    addressState: castToString,
    addressCountry: castToString,
    [FieldMetadataType.LINKS]: {
      primaryLinkLabel: castToString,
      primaryLinkUrl: castToString,
      secondaryLinks: linkArrayJSONSchema.parse,
    },

    [FieldMetadataType.PHONES]: {
      primaryPhoneCountryCode: castToString,
      primaryPhoneNumber: castToString,
      primaryPhoneCallingCode: castToString,
      additionalPhones: phoneArrayJSONSchema.parse,
    },

    [FieldMetadataType.RICH_TEXT_V2]: {
      blocknote: castToString,
      markdown: castToString,
    },

    [FieldMetadataType.EMAILS]: {
      primaryEmail: castToString,
      additionalEmails: stringArrayJSONSchema.parse,
    },
    [FieldMetadataType.FULL_NAME]: {
      firstName: undefined,
      lastName: undefined,
    },
    [FieldMetadataType.ACTOR]: {
      source: () => 'IMPORT',
      context: () => ({}),
    },
  };

  for (const field of fields) {
    const importedFieldValue = importedStructuredRow[field.name];

    switch (field.type) {
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.RICH_TEXT_V2:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.FULL_NAME: {
        const compositeData = buildCompositeFieldRecord(
          field,
          importedStructuredRow,
          COMPOSITE_FIELD_TRANSFORM_CONFIGS[field.type],
        );
        if (isDefined(compositeData)) {
          recordToBuild[field.name] = compositeData;
        }
        break;
      }
      case FieldMetadataType.PHONES: {
        const compositeData = buildCompositeFieldRecord(
          field,
          importedStructuredRow,
          COMPOSITE_FIELD_TRANSFORM_CONFIGS[field.type],
        );
        if (!isDefined(compositeData)) {
          break;
        }
        recordToBuild[field.name] = compositeData;

        // To meet backend requirements, handle case where user provides only a primaryPhoneNumber without calling code
        const primaryPhoneNumber =
          importedStructuredRow[
            getSubFieldOptionKey(field, 'primaryPhoneNumber')
          ];

        if (
          isDefined(primaryPhoneNumber) &&
          !isDefined(
            importedStructuredRow[
              getSubFieldOptionKey(field, 'primaryPhoneCountryCode')
            ],
          )
        ) {
          try {
            const {
              number: parsedNumber,
              countryCallingCode: parsedCountryCallingCode,
            } = parsePhoneNumberWithError(primaryPhoneNumber as string);
            recordToBuild[field.name] = {
              primaryPhoneNumber: parsedNumber,
              primaryPhoneCountryCode: parsedCountryCallingCode,
            };
          } catch {
            recordToBuild[field.name] = {
              primaryPhoneNumber,
              primaryPhoneCallingCode:
                stripSimpleQuotesFromString(
                  field?.defaultValue?.primaryPhoneCallingCode,
                ) || '+1',
            };
          }
        }
        break;
      }
      case FieldMetadataType.BOOLEAN:
        recordToBuild[field.name] =
          importedFieldValue === 'true' || importedFieldValue === true;
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
        recordToBuild[field.name] = Number(importedFieldValue);
        break;
      case FieldMetadataType.UUID:
        if (
          isDefined(importedFieldValue) &&
          isNonEmptyString(importedFieldValue)
        ) {
          recordToBuild[field.name] = importedFieldValue;
        }
        break;
      case FieldMetadataType.RELATION:
        if (
          isDefined(importedFieldValue) &&
          isNonEmptyString(importedFieldValue)
        )
          recordToBuild[field.name + 'Id'] = importedFieldValue;

        break;
      case FieldMetadataType.ACTOR:
        recordToBuild[field.name] = {
          source: 'IMPORT',
          context: {},
        } satisfies FieldActorForInputValue;
        break;
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.MULTI_SELECT: {
        recordToBuild[field.name] =
          stringArrayJSONSchema.parse(importedFieldValue);
        break;
      }
      case FieldMetadataType.RAW_JSON: {
        if (typeof importedFieldValue === 'string') {
          try {
            recordToBuild[field.name] = JSON.parse(importedFieldValue);
          } catch {
            break;
          }
        }
        break;
      }
      default:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] = importedFieldValue;
        }
        break;
    }
  }

  return recordToBuild;
};
