import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getFieldIdentifierType } from '@/settings/data-model/utils/getFieldIdentifierType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { type SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';
import { getSettingsObjectFieldType } from '~/pages/settings/data-model/utils/getSettingsObjectFieldType';

export const useMapFieldMetadataItemToSettingsObjectDetailTableItem = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const getRelationMetadata = useGetRelationMetadata();

  const mapFieldMetadataItemToSettingsObjectDetailTableItem = (
    fieldMetadataItem: FieldMetadataItem,
  ): SettingsObjectDetailTableItem => {
    const fieldType = getSettingsObjectFieldType(
      objectMetadataItem,
      fieldMetadataItem,
    );

    const { relationObjectMetadataItem } =
      getRelationMetadata({
        fieldMetadataItem,
      }) ?? {};

    const identifierType = getFieldIdentifierType(
      fieldMetadataItem,
      objectMetadataItem,
    );

    const fieldMetadataType = fieldMetadataItem.type as FieldType;

    return {
      fieldMetadataItem,
      fieldType: fieldType ?? '',
      dataType:
        (relationObjectMetadataItem?.labelPlural ??
        isFieldTypeSupportedInSettings(fieldMetadataType))
          ? getSettingsFieldTypeConfig(fieldMetadataType as SettingsFieldType)
              ?.label
          : '',
      label: fieldMetadataItem.label,
      identifierType: identifierType,
      objectMetadataItem,
    } satisfies SettingsObjectDetailTableItem;
  };

  return { mapFieldMetadataItemToSettingsObjectDetailTableItem };
};
