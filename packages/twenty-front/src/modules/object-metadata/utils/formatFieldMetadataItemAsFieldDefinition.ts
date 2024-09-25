import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export type FieldMetadataItemAsFieldDefinitionProps = {
  field: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  showLabel?: boolean;
  labelWidth?: number;
};

export const formatFieldMetadataItemAsFieldDefinition = ({
  field,
  objectMetadataItem,
  showLabel,
  labelWidth,
}: FieldMetadataItemAsFieldDefinitionProps): FieldDefinition<FieldMetadata> => {
  const relationObjectMetadataItem =
    field.relationDefinition?.targetObjectMetadata;

  const relationFieldMetadataId =
    field.relationDefinition?.targetFieldMetadata.id;

  const fieldDefintionMetadata = {
    fieldName: field.name,
    placeHolder: field.label,
    relationType: field.relationDefinition?.direction,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular:
      relationObjectMetadataItem?.nameSingular ?? '',
    relationObjectMetadataNamePlural:
      relationObjectMetadataItem?.namePlural ?? '',
    objectMetadataNameSingular: objectMetadataItem.nameSingular ?? '',
    targetFieldMetadataName:
      field.relationDefinition?.targetFieldMetadata?.name ?? '',
    options: field.options,
    settings: field.settings,
    isNullable: field.isNullable,
  };

  return {
    fieldMetadataId: field.id,
    label: field.label,
    showLabel,
    labelWidth,
    type: field.type,
    metadata: fieldDefintionMetadata,
    iconName: field.icon ?? 'Icon123',
    defaultValue: field.defaultValue,
    editButtonIcon: getFieldButtonIcon({
      metadata: fieldDefintionMetadata,
      type: field.type,
    }),
  };
};
