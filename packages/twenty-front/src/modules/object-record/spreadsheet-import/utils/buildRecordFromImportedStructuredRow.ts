import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldActorForInputValue } from '@/object-record/record-field/types/FieldMetadata';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { ImportedStructuredRow } from '@/spreadsheet-import/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { castToString } from '~/utils/castToString';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { isEmptyObject } from '~/utils/isEmptyObject';

type BuildRecordFromImportedStructuredRowArgs = {
  importedStructuredRow: ImportedStructuredRow<any>;
  fields: FieldMetadataItem[];
};

const buildCompositeFieldRecord = (
  fieldName: string,
  importedStructuredRow: ImportedStructuredRow<any>,
  compositeFieldConfig: Record<
    string,
    {
      labelKey: string;
      transform?: (value: any) => any;
    }
  >,
): Record<string, any> | undefined => {
  const compositeFieldRecord = Object.entries(compositeFieldConfig).reduce(
    (
      acc,
      [compositeFieldKey, { labelKey: compositeFieldLabelKey, transform }],
    ) => {
      const value =
        importedStructuredRow[`${compositeFieldLabelKey} (${fieldName})`];

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

  const {
    ADDRESS: {
      addressCity: addressCityLabel,
      addressCountry: addressCountryLabel,
      addressPostcode: addressPostcodeLabel,
      addressState: addressStateLabel,
      addressStreet1: addressStreet1Label,
      addressStreet2: addressStreet2Label,
    },
    CURRENCY: {
      amountMicros: amountMicrosLabel,
      currencyCode: currencyCodeLabel,
    },
    FULL_NAME: { firstName: firstNameLabel, lastName: lastNameLabel },
    LINKS: {
      primaryLinkUrl: primaryLinkUrlLabel,
      primaryLinkLabel: primaryLinkLabelLabel,
      secondaryLinks: secondaryLinksLabel,
    },
    EMAILS: {
      primaryEmail: primaryEmailLabel,
      additionalEmails: additionalEmailsLabel,
    },
    PHONES: {
      primaryPhoneNumber: primaryPhoneNumberLabel,
      primaryPhoneCountryCode: primaryPhoneCountryCodeLabel,
      primaryPhoneCallingCode: primaryPhoneCallingCodeLabel,
      additionalPhones: additionalPhonesLabel,
    },
    RICH_TEXT_V2: { blocknote: blocknoteLabel, markdown: markdownLabel },
  } = COMPOSITE_FIELD_SUB_FIELD_LABELS;

  const COMPOSITE_FIELD_CONFIGS = {
    [FieldMetadataType.CURRENCY]: {
      amountMicros: {
        labelKey: amountMicrosLabel,
        transform: (value: any) =>
          convertCurrencyAmountToCurrencyMicros(Number(value)),
      },
      currencyCode: { labelKey: currencyCodeLabel },
    },

    [FieldMetadataType.ADDRESS]: {
      addressStreet1: {
        labelKey: addressStreet1Label,
        transform: castToString,
      },
      addressStreet2: {
        labelKey: addressStreet2Label,
        transform: castToString,
      },
      addressCity: { labelKey: addressCityLabel, transform: castToString },
      addressPostcode: {
        labelKey: addressPostcodeLabel,
        transform: castToString,
      },
      addressState: { labelKey: addressStateLabel, transform: castToString },
      addressCountry: {
        labelKey: addressCountryLabel,
        transform: castToString,
      },
    },

    [FieldMetadataType.LINKS]: {
      primaryLinkLabel: {
        labelKey: primaryLinkLabelLabel,
        transform: castToString,
      },
      primaryLinkUrl: {
        labelKey: primaryLinkUrlLabel,
        transform: castToString,
      },
      secondaryLinks: {
        labelKey: secondaryLinksLabel,
        transform: linkArrayJSONSchema.parse,
      },
    },

    [FieldMetadataType.PHONES]: {
      primaryPhoneCountryCode: {
        labelKey: primaryPhoneCountryCodeLabel,
        transform: castToString,
      },
      primaryPhoneNumber: {
        labelKey: primaryPhoneNumberLabel,
        transform: castToString,
      },
      primaryPhoneCallingCode: {
        labelKey: primaryPhoneCallingCodeLabel,
        transform: castToString,
      },
      additionalPhones: {
        labelKey: additionalPhonesLabel,
        transform: phoneArrayJSONSchema.parse,
      },
    },

    [FieldMetadataType.RICH_TEXT_V2]: {
      blocknote: { labelKey: blocknoteLabel, transform: castToString },
      markdown: { labelKey: markdownLabel, transform: castToString },
    },

    [FieldMetadataType.EMAILS]: {
      primaryEmail: { labelKey: primaryEmailLabel, transform: castToString },
      additionalEmails: {
        labelKey: additionalEmailsLabel,
        transform: stringArrayJSONSchema.parse,
      },
    },

    [FieldMetadataType.FULL_NAME]: {
      firstName: { labelKey: firstNameLabel },
      lastName: { labelKey: lastNameLabel },
    },
    [FieldMetadataType.ACTOR]: {
      source: { labelKey: 'source', transform: () => 'IMPORT' },
      context: { labelKey: 'context', transform: () => ({}) },
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
      case FieldMetadataType.PHONES:
      case FieldMetadataType.FULL_NAME: {
        const compositeData = buildCompositeFieldRecord(
          field.name,
          importedStructuredRow,
          COMPOSITE_FIELD_CONFIGS[field.type],
        );
        if (isDefined(compositeData)) {
          recordToBuild[field.name] = compositeData;
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
