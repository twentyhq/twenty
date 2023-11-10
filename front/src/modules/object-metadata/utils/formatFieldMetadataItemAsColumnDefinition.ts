import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { Field } from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { parseFieldType } from './parseFieldType';

export const formatFieldMetadataItemAsColumnDefinition = ({
  position,
  field,
  objectMetadataItem,
  icons,
}: {
  position: number;
  field: Field;
  objectMetadataItem: Omit<ObjectMetadataItem, 'fields'>;
  icons: Record<string, IconComponent>;
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
  Icon: icons[field.icon ?? 'Icon123'],
  isVisible: true,
  basePathToShowPage: `/object/${objectMetadataItem.nameSingular}/`,
});
