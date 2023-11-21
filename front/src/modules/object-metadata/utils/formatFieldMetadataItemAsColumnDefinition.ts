import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

import { parseFieldType } from './parseFieldType';

export const formatFieldMetadataItemAsColumnDefinition = ({
  position,
  field,
}: {
  position: number;
  field: FieldMetadataItem;
}): ColumnDefinition<FieldMetadata> => {
  const relationObjectMetadataItem =
    field.toRelationMetadata?.fromObjectMetadata;

  return {
    position,
    fieldMetadataId: field.id,
    label: field.label,
    size: 100,
    type: parseFieldType(field.type),
    metadata: {
      fieldName: field.name,
      placeHolder: field.label,
      relationType: parseFieldRelationType(field),
      objectMetadataNameSingular:
        relationObjectMetadataItem?.nameSingular ?? '',
      objectMetadataNamePlural: relationObjectMetadataItem?.namePlural ?? '',
    },
    iconName: field.icon ?? 'Icon123',
    isVisible: true,
  };
};
