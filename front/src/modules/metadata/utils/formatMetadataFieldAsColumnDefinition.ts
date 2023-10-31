import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { MetadataObject } from '../types/MetadataObject';

import { parseFieldType } from './parseFieldType';

export const formatMetadataFieldAsColumnDefinition = ({
  position,
  field,
  metadataObject,
  icons,
}: {
  position: number;
  field: MetadataObject['fields'][0];
  metadataObject: Omit<MetadataObject, 'fields'>;
  icons: Record<string, any>;
}): ColumnDefinition<FieldMetadata> => ({
  position,
  fieldId: field.id,
  label: field.label,
  size: 100,
  type: parseFieldType(field.type),
  metadata: {
    fieldName: field.name,
    placeHolder: field.label,
  },
  Icon: icons[field.icon ?? 'Icon123'],
  isVisible: true,
  basePathToShowPage: `/object/${metadataObject.nameSingular}/`,
});
