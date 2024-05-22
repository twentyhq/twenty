import { isString } from '@sniptt/guards';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getFieldDefaultPreviewValue = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'defaultValue' | 'options'
  > & {
    id?: string;
    name?: string;
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
}) => {
  if (fieldMetadataItem.type === FieldMetadataType.Select) {
    const defaultValue = isString(fieldMetadataItem.defaultValue)
      ? stripSimpleQuotesFromString(fieldMetadataItem.defaultValue)
      : null;
    return defaultValue ?? fieldMetadataItem.options?.[0]?.value ?? null;
  }

  if (fieldMetadataItem.type === FieldMetadataType.MultiSelect) {
    const defaultValues = Array.isArray(fieldMetadataItem.defaultValue)
      ? fieldMetadataItem.defaultValue?.map((defaultValue: `'${string}'`) =>
          stripSimpleQuotesFromString(defaultValue),
        )
      : null;
    return defaultValues?.length
      ? defaultValues
      : fieldMetadataItem.options?.map(({ value }) => value) ?? null;
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.Relation &&
    isDefined(relationObjectMetadataItem)
  ) {
    const relationLabelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(relationObjectMetadataItem);

    if (!relationLabelIdentifierFieldMetadataItem) return null;

    const { type: relationLabelIdentifierFieldType } =
      relationLabelIdentifierFieldMetadataItem;
    const relationFieldTypeConfig = getSettingsFieldTypeConfig(
      relationLabelIdentifierFieldType,
    );

    const defaultRelationLabelIdentifierFieldValue =
      relationLabelIdentifierFieldType === FieldMetadataType.Text
        ? relationObjectMetadataItem.labelSingular
        : relationFieldTypeConfig?.defaultValue;

    const defaultRelationRecord = {
      [relationLabelIdentifierFieldMetadataItem.name]:
        defaultRelationLabelIdentifierFieldValue,
    };

    return defaultRelationRecord;
  }

  const isLabelIdentifier =
    !!fieldMetadataItem.id &&
    !!fieldMetadataItem.name &&
    isLabelIdentifierField({
      fieldMetadataItem: {
        id: fieldMetadataItem.id,
        name: fieldMetadataItem.name,
      },
      objectMetadataItem,
    });

  const fieldTypeConfig = getSettingsFieldTypeConfig(fieldMetadataItem.type);

  return isLabelIdentifier && fieldMetadataItem.type === FieldMetadataType.Text
    ? objectMetadataItem.labelSingular
    : fieldTypeConfig?.defaultValue;
};
