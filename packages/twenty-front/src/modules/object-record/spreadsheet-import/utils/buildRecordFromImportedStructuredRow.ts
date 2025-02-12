import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldAddressValue,
  FieldEmailsValue,
  FieldLinksValue,
  FieldPhonesValue,
  FieldRichTextV2Value,
} from '@/object-record/record-field/types/FieldMetadata';
import { COMPOSITE_FIELD_IMPORT_LABELS } from '@/object-record/spreadsheet-import/constants/CompositeFieldImportLabels';
import { ImportedStructuredRow } from '@/spreadsheet-import/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { castToString } from '~/utils/castToString';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';

export const buildRecordFromImportedStructuredRow = (
  importedStructuredRow: ImportedStructuredRow<any>,
  fields: FieldMetadataItem[],
) => {
  const recordToBuild: Record<string, any> = {};

  const {
    ADDRESS: {
      addressCityLabel,
      addressCountryLabel,
      addressLatLabel,
      addressLngLabel,
      addressPostcodeLabel,
      addressStateLabel,
      addressStreet1Label,
      addressStreet2Label,
    },
    CURRENCY: { amountMicrosLabel, currencyCodeLabel },
    FULL_NAME: { firstNameLabel, lastNameLabel },
    LINKS: { primaryLinkUrlLabel },
    EMAILS: { primaryEmailLabel },
    PHONES: { primaryPhoneNumberLabel, primaryPhoneCountryCodeLabel },
    RICH_TEXT_V2: { blocknoteLabel, markdownLabel },
  } = COMPOSITE_FIELD_IMPORT_LABELS;

  for (const field of fields) {
    const importedFieldValue = importedStructuredRow[field.name];

    switch (field.type) {
      case FieldMetadataType.BOOLEAN:
        recordToBuild[field.name] =
          importedFieldValue === 'true' || importedFieldValue === true;
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
        recordToBuild[field.name] = Number(importedFieldValue);
        break;
      case FieldMetadataType.CURRENCY:
        if (
          isDefined(
            importedStructuredRow[`${amountMicrosLabel} (${field.name})`],
          ) ||
          isDefined(
            importedStructuredRow[`${currencyCodeLabel} (${field.name})`],
          )
        ) {
          recordToBuild[field.name] = {
            amountMicros: convertCurrencyAmountToCurrencyMicros(
              Number(
                importedStructuredRow[`${amountMicrosLabel} (${field.name})`],
              ),
            ),
            currencyCode:
              importedStructuredRow[`${currencyCodeLabel} (${field.name})`] ||
              'USD',
          };
        }
        break;
      case FieldMetadataType.ADDRESS: {
        if (
          isDefined(
            importedStructuredRow[`${addressStreet1Label} (${field.name})`] ||
              importedStructuredRow[`${addressStreet2Label} (${field.name})`] ||
              importedStructuredRow[`${addressCityLabel} (${field.name})`] ||
              importedStructuredRow[
                `${addressPostcodeLabel} (${field.name})`
              ] ||
              importedStructuredRow[`${addressStateLabel} (${field.name})`] ||
              importedStructuredRow[`${addressCountryLabel} (${field.name})`] ||
              importedStructuredRow[`${addressLatLabel} (${field.name})`] ||
              importedStructuredRow[`${addressLngLabel} (${field.name})`],
          )
        ) {
          recordToBuild[field.name] = {
            addressStreet1: castToString(
              importedStructuredRow[`${addressStreet1Label} (${field.name})`],
            ),
            addressStreet2: castToString(
              importedStructuredRow[`${addressStreet2Label} (${field.name})`],
            ),
            addressCity: castToString(
              importedStructuredRow[`${addressCityLabel} (${field.name})`],
            ),
            addressPostcode: castToString(
              importedStructuredRow[`${addressPostcodeLabel} (${field.name})`],
            ),
            addressState: castToString(
              importedStructuredRow[`${addressStateLabel} (${field.name})`],
            ),
            addressCountry: castToString(
              importedStructuredRow[`${addressCountryLabel} (${field.name})`],
            ),
            addressLat: Number(
              importedStructuredRow[`${addressLatLabel} (${field.name})`],
            ),
            addressLng: Number(
              importedStructuredRow[`${addressLngLabel} (${field.name})`],
            ),
          } satisfies FieldAddressValue;
        }
        break;
      }
      case FieldMetadataType.LINKS: {
        if (
          isDefined(
            importedStructuredRow[`${primaryLinkUrlLabel} (${field.name})`],
          )
        ) {
          recordToBuild[field.name] = {
            primaryLinkLabel: '',
            primaryLinkUrl: castToString(
              importedStructuredRow[`${primaryLinkUrlLabel} (${field.name})`],
            ),
            secondaryLinks: [],
          } satisfies FieldLinksValue;
        }
        break;
      }
      case FieldMetadataType.PHONES: {
        if (
          isDefined(
            importedStructuredRow[
              `${primaryPhoneCountryCodeLabel} (${field.name})`
            ] ||
              importedStructuredRow[
                `${primaryPhoneNumberLabel} (${field.name})`
              ],
          )
        ) {
          recordToBuild[field.name] = {
            primaryPhoneCountryCode: castToString(
              importedStructuredRow[
                `${primaryPhoneCountryCodeLabel} (${field.name})`
              ],
            ),
            primaryPhoneNumber: castToString(
              importedStructuredRow[
                `${primaryPhoneNumberLabel} (${field.name})`
              ],
            ),
            additionalPhones: null,
          } satisfies FieldPhonesValue;
        }
        break;
      }
      case FieldMetadataType.RICH_TEXT_V2: {
        if (
          isDefined(
            importedStructuredRow[`${blocknoteLabel} (${field.name})`] ||
              importedStructuredRow[`${markdownLabel} (${field.name})`],
          )
        ) {
          recordToBuild[field.name] = {
            blocknote: castToString(
              importedStructuredRow[`${blocknoteLabel} (${field.name})`],
            ),
            markdown: castToString(
              importedStructuredRow[`${markdownLabel} (${field.name})`],
            ),
          } satisfies FieldRichTextV2Value;
        }
        break;
      }
      case FieldMetadataType.EMAILS: {
        if (
          isDefined(
            importedStructuredRow[`${primaryEmailLabel} (${field.name})`],
          )
        ) {
          recordToBuild[field.name] = {
            primaryEmail: castToString(
              importedStructuredRow[`${primaryEmailLabel} (${field.name})`],
            ),
            additionalEmails: null,
          } satisfies FieldEmailsValue;
        }
        break;
      }
      case FieldMetadataType.RELATION:
        if (
          isDefined(importedFieldValue) &&
          (isNonEmptyString(importedFieldValue) || importedFieldValue !== false)
        ) {
          recordToBuild[field.name + 'Id'] = importedFieldValue;
        }
        break;
      case FieldMetadataType.FULL_NAME:
        if (
          isDefined(
            importedStructuredRow[`${firstNameLabel} (${field.name})`] ??
              importedStructuredRow[`${lastNameLabel} (${field.name})`],
          )
        ) {
          recordToBuild[field.name] = {
            firstName:
              importedStructuredRow[`${firstNameLabel} (${field.name})`] ?? '',
            lastName:
              importedStructuredRow[`${lastNameLabel} (${field.name})`] ?? '',
          };
        }
        break;
      case FieldMetadataType.ACTOR:
        recordToBuild[field.name] = {
          source: 'IMPORT',
        };
        break;
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.MULTI_SELECT: {
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
        recordToBuild[field.name] = importedFieldValue;
        break;
    }
  }

  return recordToBuild;
};
