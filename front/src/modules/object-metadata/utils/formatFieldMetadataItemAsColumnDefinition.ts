import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { FieldMetadataItem } from '../types/FieldMetadataItem';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { parseFieldType } from './parseFieldType';

export const formatFieldMetadataItemAsColumnDefinition = ({
  position,
  field,
  objectMetadataItem,
}: {
  position: number;
  field: FieldMetadataItem;
  objectMetadataItem: Omit<ObjectMetadataItem, 'fields'>;
}): ColumnDefinition<FieldMetadata> => ({
  position,
  fieldMetadataId: field.id,
  label: field.label,
  size: 100,
  type: parseFieldType(field.type),
  metadata: {
    fieldName: field.name,
    placeHolder: field.label,
  },
  iconName: field.icon ?? 'Icon123',
  isVisible: true,
  basePathToShowPage: `/object/${objectMetadataItem.nameSingular}/`,
  relationType: parseFieldRelationType(field),
});
