import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';

import { SettingsObjectFieldSelectFormValues } from '../components/SettingsObjectFieldSelectForm';
import { settingsFieldMetadataTypes } from '../constants/settingsFieldMetadataTypes';

import { useFieldPreviewValue } from './useFieldPreviewValue';
import { useRelationFieldPreviewValue } from './useRelationFieldPreviewValue';

export const useFieldPreview = ({
  fieldMetadata,
  objectMetadataId,
  relationObjectMetadataId,
  selectOptions,
}: {
  fieldMetadata: Pick<Field, 'icon' | 'label' | 'type'> & { id?: string };
  objectMetadataId: string;
  relationObjectMetadataId?: string;
  selectOptions?: SettingsObjectFieldSelectFormValues;
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();
  const objectMetadataItem = findObjectMetadataItemById(objectMetadataId);

  const { Icon: ObjectIcon } = useLazyLoadIcon(objectMetadataItem?.icon ?? '');
  const { Icon: FieldIcon } = useLazyLoadIcon(fieldMetadata.icon ?? '');

  const fieldName = fieldMetadata.id
    ? objectMetadataItem?.fields.find(({ id }) => id === fieldMetadata.id)?.name
    : undefined;

  const { value: firstRecordFieldValue } = useFieldPreviewValue({
    fieldName: fieldName || '',
    objectNamePlural: objectMetadataItem?.namePlural || '',
    skip:
      !fieldName ||
      !objectMetadataItem ||
      fieldMetadata.type === FieldMetadataType.Relation,
  });

  const { relationObjectMetadataItem, value: relationValue } =
    useRelationFieldPreviewValue({
      relationObjectMetadataId,
      skip: fieldMetadata.type !== FieldMetadataType.Relation,
    });

  const defaultValue =
    fieldMetadata.type === FieldMetadataType.Enum
      ? selectOptions?.[0]
      : settingsFieldMetadataTypes[fieldMetadata.type].defaultValue;

  const isValidSelectValue =
    fieldMetadata.type === FieldMetadataType.Enum &&
    !!firstRecordFieldValue &&
    selectOptions?.some(
      (selectOption) => selectOption.text === firstRecordFieldValue,
    );

  return {
    entityId: `${objectMetadataId}-field-form`,
    FieldIcon,
    fieldName: fieldName || `${fieldMetadata.type}-new-field`,
    ObjectIcon,
    objectMetadataItem,
    relationObjectMetadataItem,
    value:
      (fieldMetadata.type === FieldMetadataType.Relation
        ? relationValue
        : fieldMetadata.type !== FieldMetadataType.Enum || isValidSelectValue
        ? firstRecordFieldValue
        : undefined) || defaultValue,
  };
};
