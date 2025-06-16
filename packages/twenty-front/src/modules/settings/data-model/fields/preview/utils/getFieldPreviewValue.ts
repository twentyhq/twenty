import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { isDefined } from 'twenty-shared/utils';
import { stripSimpleQuotesFromStringRecursive } from '~/utils/string/stripSimpleQuotesFromString';

type getFieldPreviewValueArgs = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'defaultValue'>;
};
export const getFieldPreviewValue = ({
  fieldMetadataItem,
}: getFieldPreviewValueArgs) => {
  if (!isFieldTypeSupportedInSettings(fieldMetadataItem.type)) return null;

  if (
    !isFieldValueEmpty({
      fieldDefinition: { type: fieldMetadataItem.type },
      fieldValue: stripSimpleQuotesFromStringRecursive(
        fieldMetadataItem.defaultValue,
      ),
    })
  ) {
    return generateEmptyFieldValue({
      fieldMetadataItem,
    });
  }

  const fieldTypeConfig = getSettingsFieldTypeConfig(fieldMetadataItem.type);

  if (
    isDefined(fieldTypeConfig) &&
    'exampleValues' in fieldTypeConfig &&
    isDefined(fieldTypeConfig.exampleValues?.[0])
  ) {
    return fieldTypeConfig.exampleValues?.[0];
  }

  return null;
};
