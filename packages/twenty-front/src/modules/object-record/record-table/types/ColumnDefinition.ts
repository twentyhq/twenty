import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

export type ColumnDefinition<T extends FieldMetadata> = FieldDefinition<T> & {
  size: number;
  position: number;
  isLabelIdentifier?: boolean;
  isVisible?: boolean;
  viewFieldId?: string;
  isFilterable?: boolean;
  isSortable?: boolean;
};
