import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

import { parseFieldType } from './parseFieldType';

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
}: FieldMetadataItemAsFieldDefinitionProps) => {
  const relationObjectMetadataItem =
    field.toRelationMetadata?.fromObjectMetadata ||
    field.fromRelationMetadata?.toObjectMetadata;

  const relationFieldMetadataId =
    field.toRelationMetadata?.fromFieldMetadataId ||
    field.fromRelationMetadata?.toFieldMetadataId;

  return {
    fieldMetadataId: field.id,
    label: field.label,
    showLabel,
    labelWidth,
    type: parseFieldType(field.type),
    metadata: {
      fieldName: field.name,
      placeHolder: field.label,
      relationType: parseFieldRelationType(field),
      relationFieldMetadataId,
      relationObjectMetadataNameSingular:
        relationObjectMetadataItem?.nameSingular ?? '',
      relationObjectMetadataNamePlural:
        relationObjectMetadataItem?.namePlural ?? '',
      objectMetadataNameSingular: objectMetadataItem.nameSingular ?? '',
      options: field.options,
    },
    iconName: field.icon ?? 'Icon123',
  };
};
