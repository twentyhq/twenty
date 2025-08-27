import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { stripSimpleQuotesFromStringRecursive } from '~/utils/string/stripSimpleQuotesFromString';

type getFieldPreviewValueArgs = {
  fieldType: FieldMetadataType;
  fieldSettings: FieldMetadata['settings'];
  defaultValue: unknown;
};
export const getFieldPreviewValue = ({
  fieldType,
  fieldSettings,
  defaultValue,
}: getFieldPreviewValueArgs) => {
  if (!isFieldTypeSupportedInSettings(fieldType)) return null;

  if (
    !isFieldValueEmpty({
      fieldDefinition: { type: fieldType },
      fieldValue: stripSimpleQuotesFromStringRecursive(defaultValue),
    })
  ) {
    return generateEmptyFieldValue({
      fieldMetadataItem: {
        type: fieldType,
        settings: fieldSettings,
        defaultValue,
      },
      shouldComputeFunctionDefaultValue: true,
    });
  }

  const fieldTypeConfig = getSettingsFieldTypeConfig(fieldType);

  if (
    isDefined(fieldTypeConfig) &&
    'exampleValues' in fieldTypeConfig &&
    isDefined(fieldTypeConfig.exampleValues?.[0])
  ) {
    return fieldTypeConfig.exampleValues?.[0];
  }

  return null;
};
