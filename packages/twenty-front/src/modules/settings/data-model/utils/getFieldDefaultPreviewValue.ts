import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { SETTINGS_FIELD_METADATA_TYPES } from '@/settings/data-model/constants/SettingsFieldMetadataTypes';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isNonNullable } from '~/utils/isNonNullable';

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
  // Select field
  if (
    fieldMetadataItem.type === FieldMetadataType.Select &&
    isNonNullable(selectOptions)
  ) {
    return selectOptions.find(({ isDefault }) => isDefault) || selectOptions[0];
  }

  // Relation field
  if (
    fieldMetadataItem.type === FieldMetadataType.Relation &&
    isNonNullable(relationObjectMetadataItem)
  ) {
    const relationLabelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(relationObjectMetadataItem);

    if (!relationLabelIdentifierFieldMetadataItem) return null;

    const defaultRelationLabelIdentifierFieldValue =
      relationLabelIdentifierFieldMetadataItem.type === FieldMetadataType.Text
        ? relationObjectMetadataItem.labelSingular
        : SETTINGS_FIELD_METADATA_TYPES[
            relationLabelIdentifierFieldMetadataItem.type
          ]?.defaultValue;

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

  // Other fields
  return isLabelIdentifier && fieldMetadataItem.type === FieldMetadataType.Text
    ? objectMetadataItem.labelSingular
    : SETTINGS_FIELD_METADATA_TYPES[fieldMetadataItem.type]?.defaultValue;
};
