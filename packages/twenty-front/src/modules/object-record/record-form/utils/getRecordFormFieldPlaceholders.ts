import { type FormFieldInputSubFieldPlaceholders } from '@/object-record/record-field/ui/form-types/types/FormFieldInputSubFieldPlaceholders';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import {
  convertCurrencyMicrosToCurrencyAmount,
  isDefined,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type RecordFormFieldPlaceholders = {
  placeholder?: string;
  subFieldPlaceholders?: FormFieldInputSubFieldPlaceholders;
};

const getNonCompositeExampleValue = (
  fieldType: keyof typeof SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS,
): unknown =>
  SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues?.[0];

export const getRecordFormFieldPlaceholders = (
  fieldType: FieldMetadataType,
): RecordFormFieldPlaceholders => {
  switch (fieldType) {
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.UUID: {
      const exampleValue = getNonCompositeExampleValue(fieldType);

      return isDefined(exampleValue)
        ? { placeholder: String(exampleValue) }
        : {};
    }
    case FieldMetadataType.RAW_JSON: {
      const exampleValue = getNonCompositeExampleValue(fieldType);

      return isDefined(exampleValue)
        ? { placeholder: JSON.stringify(exampleValue) }
        : {};
    }
    case FieldMetadataType.CURRENCY: {
      const [{ amountMicros }] =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues;

      return {
        subFieldPlaceholders: {
          amountMicros: String(
            convertCurrencyMicrosToCurrencyAmount(amountMicros),
          ),
        },
      };
    }
    case FieldMetadataType.EMAILS: {
      const [{ primaryEmail }] =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues;

      return { subFieldPlaceholders: { primaryEmail } };
    }
    case FieldMetadataType.LINKS: {
      const [{ primaryLinkUrl }] =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues;

      return { subFieldPlaceholders: { primaryLinkUrl } };
    }
    case FieldMetadataType.PHONES: {
      const [{ primaryPhoneNumber }] =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues;

      return { subFieldPlaceholders: { primaryPhoneNumber } };
    }
    case FieldMetadataType.FULL_NAME: {
      const [{ firstName, lastName }] =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues;

      return { subFieldPlaceholders: { firstName, lastName } };
    }
    case FieldMetadataType.ADDRESS: {
      const [{ addressStreet1, addressCity, addressState, addressPostcode }] =
        SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues;

      return {
        subFieldPlaceholders: {
          addressStreet1,
          addressCity,
          addressState,
          addressPostcode,
        },
      };
    }
    default:
      return {};
  }
};
