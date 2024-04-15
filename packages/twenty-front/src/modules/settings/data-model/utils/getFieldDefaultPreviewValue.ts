import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const getFieldDefaultPreviewValue = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
  selectOptions,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type'> & {
    id?: string;
    name?: string;
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
  selectOptions?: SettingsObjectFieldSelectFormValues;
}) => {
  if (
    fieldMetadataItem.type === FieldMetadataType.Select &&
    isDefined(selectOptions)
  ) {
    const defaultSelectOption =
      selectOptions.find(({ isDefault }) => isDefault) || selectOptions[0];
    return defaultSelectOption.value;
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.MultiSelect &&
    isDefined(selectOptions)
  ) {
    return selectOptions.map((selectOption) => selectOption.value);
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
