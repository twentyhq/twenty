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
  const relationObjectMetadataItem = field.relation?.targetObjectMetadata;

  const relationFieldMetadataId = field.relation?.targetFieldMetadata.id;

  const fieldDefintionMetadata = {
    fieldName: field.name,
    placeHolder: field.label,
    relationType: field.relation?.type,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular:
      relationObjectMetadataItem?.nameSingular ?? '',
    relationObjectMetadataNamePlural:
      relationObjectMetadataItem?.namePlural ?? '',
    relationObjectMetadataId: relationObjectMetadataItem?.id ?? '',
    objectMetadataNameSingular: objectMetadataItem.nameSingular ?? '',
    targetFieldMetadataName: field.relation?.targetFieldMetadata?.name ?? '',
    options: field.options,
    settings: field.settings,
    isNullable: field.isNullable,
    isCustom: field.isCustom ?? false,
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
