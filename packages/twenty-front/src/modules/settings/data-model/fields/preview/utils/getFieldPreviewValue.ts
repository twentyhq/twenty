import { isNonEmptyString, isString } from '@sniptt/guards';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'defaultValue'>;
}) => {
  if (
    isString(fieldMetadataItem.defaultValue)
      ? isNonEmptyString(
          stripSimpleQuotesFromString(fieldMetadataItem.defaultValue),
        )
      : isDefined(fieldMetadataItem.defaultValue)
  ) {
    return fieldMetadataItem.defaultValue;
  }

  const fieldTypeConfig = getSettingsFieldTypeConfig(fieldMetadataItem.type);

  if (
    isDefined(fieldTypeConfig) &&
    'defaultValue' in fieldTypeConfig &&
    isDefined(fieldTypeConfig.defaultValue)
  ) {
    return fieldTypeConfig.defaultValue;
  }

  return null;
};
