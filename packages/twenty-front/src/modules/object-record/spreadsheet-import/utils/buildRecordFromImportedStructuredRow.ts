import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type FieldActorForInputValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getCompositeSubFieldKey } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetCompositeSubFieldKey';
import {
  type ImportedStructuredRow,
  type SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
import { isNonEmptyString } from '@sniptt/guards';
import { parsePhoneNumberWithError, type CountryCode } from 'libphonenumber-js';
import {
  assertUnreachable,
  isDefined,
  isEmptyObject,
} from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { castToString } from '~/utils/castToString';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type BuildRecordFromImportedStructuredRowArgs = {
  importedStructuredRow: ImportedStructuredRow;
  fieldMetadataItems: FieldMetadataItem[];
  spreadsheetImportFields: SpreadsheetImportFields;
};

const buildCompositeFieldRecord = (
  field: FieldMetadataItem,
  importedStructuredRow: ImportedStructuredRow,
  compositeFieldConfig: Record<string, ((value: any) => any) | undefined>,
): Record<string, any> | undefined => {
  const compositeFieldRecord = Object.entries(compositeFieldConfig).reduce(
    (acc, [compositeFieldKey, transform]) => {
      const value =
        importedStructuredRow[
          getCompositeSubFieldKey(field, compositeFieldKey)
        ];

      return isDefined(value)
        ? { ...acc, [compositeFieldKey]: transform?.(value) || value }
        : acc;
    },
    {},
  );

  return isEmptyObject(compositeFieldRecord) ? undefined : compositeFieldRecord;
};

const buildRelationConnectFieldRecord = (
  fieldMetadataItem: FieldMetadataItem,
  importedStructuredRow: ImportedStructuredRow,
  spreadsheetImportFields: SpreadsheetImportFields,
) => {
  if (fieldMetadataItem.relation?.type !== RelationType.MANY_TO_ONE)
    return undefined;

  const relationConnectFields = spreadsheetImportFields.filter(
    (field) =>
      field.fieldMetadataItemId === fieldMetadataItem.id &&
      isDefined(importedStructuredRow[field.key]) &&
      isNonEmptyString(importedStructuredRow[field.key]),
  );

  if (relationConnectFields.length === 0) return undefined;

  const relationConnectFieldValue = relationConnectFields.reduce(
    (acc, field) => {
      const uniqueFieldMetadataItem = field.uniqueFieldMetadataItem;
      if (!isDefined(uniqueFieldMetadataItem)) return acc;

      if (
        isCompositeFieldType(uniqueFieldMetadataItem.type) &&
        isDefined(field.compositeSubFieldKey)
      ) {
        return {
          ...acc,
          [uniqueFieldMetadataItem.name]: {
            ...(isDefined(acc?.[uniqueFieldMetadataItem.name])
              ? acc[uniqueFieldMetadataItem.name]
              : {}),
            [field.compositeSubFieldKey]: importedStructuredRow[field.key],
          },
        };
      }
      return {
        ...acc,
        [uniqueFieldMetadataItem.name]: importedStructuredRow[field.key],
      };
    },
    {} as Record<string, any>,
  );

  return isEmptyObject(relationConnectFieldValue)
    ? undefined
    : { connect: { where: relationConnectFieldValue } };
};

export const buildRecordFromImportedStructuredRow = ({
  fieldMetadataItems,
  importedStructuredRow,
  spreadsheetImportFields,
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
      addressStreet2: castToString,
      addressCity: castToString,
      addressPostcode: castToString,
      addressState: castToString,
      addressCountry: castToString,
    },
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

  for (const field of fieldMetadataItems) {
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

        const primaryPhoneNumber =
          importedStructuredRow[
            getCompositeSubFieldKey(field, 'primaryPhoneNumber')
          ];

        const primaryPhoneCallingCode =
          importedStructuredRow[
            getCompositeSubFieldKey(field, 'primaryPhoneCallingCode')
          ];

        const hasUserProvidedPrimaryPhoneNumberWithoutCallingCode =
          isDefined(primaryPhoneNumber) &&
          (!isDefined(primaryPhoneCallingCode) ||
            !isNonEmptyString(primaryPhoneCallingCode));

        // To meet backend requirements, handle case where user provides only a primaryPhoneNumber without calling code
        if (hasUserProvidedPrimaryPhoneNumberWithoutCallingCode) {
          const primaryPhoneCountryCode =
            importedStructuredRow[
              getCompositeSubFieldKey(field, 'primaryPhoneCountryCode')
            ];

          const hasUserProvidedPrimaryPhoneCountryCode =
            isDefined(primaryPhoneCountryCode) &&
            isNonEmptyString(primaryPhoneCountryCode);

          try {
            const {
              number: parsedNumber,
              countryCallingCode: parsedCountryCallingCode,
            } = parsePhoneNumberWithError(
              primaryPhoneNumber as string,
              hasUserProvidedPrimaryPhoneCountryCode
                ? (primaryPhoneCountryCode as CountryCode)
                : undefined,
            );

            recordToBuild[field.name] = {
              primaryPhoneNumber: parsedNumber,
              primaryPhoneCallingCode: `+${parsedCountryCallingCode}`,
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
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] =
            importedFieldValue === 'true' || importedFieldValue === true;
        }
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] = Number(importedFieldValue);
        }
        break;
      case FieldMetadataType.RELATION: {
        const relationConnectFieldValue = buildRelationConnectFieldRecord(
          field,
          importedStructuredRow,
          spreadsheetImportFields,
        );
        if (isDefined(relationConnectFieldValue)) {
          recordToBuild[field.name] = relationConnectFieldValue;
        }

        break;
      }
      case FieldMetadataType.ACTOR:
        recordToBuild[field.name] = {
          source: 'IMPORT',
          context: {},
        } satisfies FieldActorForInputValue;
        break;
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.MULTI_SELECT: {
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] =
            stringArrayJSONSchema.parse(importedFieldValue);
        }
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
      case FieldMetadataType.UUID:
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        if (
          isDefined(importedFieldValue) &&
          isNonEmptyString(importedFieldValue)
        ) {
          recordToBuild[field.name] = importedFieldValue;
        }
        break;
      case FieldMetadataType.SELECT:
      case FieldMetadataType.RATING:
      case FieldMetadataType.TEXT:
        if (isDefined(importedFieldValue)) {
          recordToBuild[field.name] = importedFieldValue;
        }
        break;
      case FieldMetadataType.MORPH_RELATION:
      case FieldMetadataType.POSITION:
      case FieldMetadataType.RICH_TEXT:
      case FieldMetadataType.TS_VECTOR:
        break;
      default:
        assertUnreachable(field.type);
    }
  }

  return recordToBuild;
};
