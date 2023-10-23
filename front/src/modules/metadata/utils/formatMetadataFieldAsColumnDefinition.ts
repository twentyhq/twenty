import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { FieldType } from '@/ui/data/field/types/FieldType';
import { IconBrandLinkedin } from '@/ui/display/icon';

import { MetadataObject } from '../types/MetadataObject';

const parseFieldType = (fieldType: string): FieldType => {
  if (fieldType === 'url') {
    return 'urlV2';
  }

  return fieldType as FieldType;
};

export const formatMetadataFieldAsColumnDefinition = ({
  index,
  field,
}: {
  index: number;
  field: MetadataObject['fields'][0];
}): ColumnDefinition<FieldMetadata> => ({
  index,
  key: field.name,
  name: field.label,
  size: 100,
  type: parseFieldType(field.type),
  metadata: {
    fieldName: field.name,
    placeHolder: field.label,
  },
  Icon: IconBrandLinkedin,
  isVisible: true,
});
