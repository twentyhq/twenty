import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { SettingsObjectFieldPipelineStepFormOption } from '@/settings/data-model/types/SettingsObjectFieldPipelineStepFormOption';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';

import { settingsFieldMetadataTypes } from '../constants/settingsFieldMetadataTypes';
import { SettingsObjectFieldSelectFormOption } from '../types/SettingsObjectFieldSelectFormOption';

import { useFieldPreviewValue } from './useFieldPreviewValue';
import { useRelationFieldPreviewValue } from './useRelationFieldPreviewValue';

export const useFieldPreview = ({
  fieldMetadata,
  objectMetadataId,
  relationObjectMetadataId,
  selectOptions,
  pipelineStepOptions,
}: {
  fieldMetadata: Pick<Field, 'icon' | 'label' | 'type'> & { id?: string };
  objectMetadataId: string;
  relationObjectMetadataId?: string;
  selectOptions?: SettingsObjectFieldSelectFormOption[];
  pipelineStepOptions?: SettingsObjectFieldPipelineStepFormOption[];
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();
  const objectMetadataItem = findObjectMetadataItemById(objectMetadataId);

  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem?.icon);
  const FieldIcon = getIcon(fieldMetadata.icon);

  const fieldName = fieldMetadata.id
    ? objectMetadataItem?.fields.find(({ id }) => id === fieldMetadata.id)?.name
    : undefined;

  const { value: firstRecordFieldValue } = useFieldPreviewValue({
    fieldName: fieldName || '',
    objectNamePlural: objectMetadataItem?.namePlural ?? '',
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

  const settingsFieldMetadataType =
    settingsFieldMetadataTypes[fieldMetadata.type];

  const defaultSelectValue = selectOptions?.[0];
  const selectValue =
    fieldMetadata.type === FieldMetadataType.Select &&
    typeof firstRecordFieldValue === 'string'
      ? selectOptions?.find(
          (selectOption) => selectOption.value === firstRecordFieldValue,
        )
      : undefined;

  const defaultPipelineStepValue = pipelineStepOptions?.[0];
  const pipelineStepValue =
    fieldMetadata.type === FieldMetadataType.PipelineStep &&
    typeof firstRecordFieldValue === 'string'
      ? pipelineStepOptions?.find(
          (pipelineStepOpition) =>
            pipelineStepOpition.value === firstRecordFieldValue,
        )
      : undefined;
  return {
    entityId: `${objectMetadataId}-field-form`,
    FieldIcon,
    fieldName: fieldName || `${fieldMetadata.type}-new-field`,
    ObjectIcon,
    objectMetadataItem,
    relationObjectMetadataItem,
    value:
      fieldMetadata.type === FieldMetadataType.Relation
        ? relationValue
        : fieldMetadata.type === FieldMetadataType.Select
          ? selectValue || defaultSelectValue
          : fieldMetadata.type === FieldMetadataType.PipelineStep
            ? pipelineStepValue || defaultPipelineStepValue
            : firstRecordFieldValue || settingsFieldMetadataType?.defaultValue,
  };
};
