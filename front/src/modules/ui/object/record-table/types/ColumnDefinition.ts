import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';

export type ColumnDefinition<T extends FieldMetadata> = FieldDefinition<T> & {
  size: number;
  position: number;
  isVisible?: boolean;
  viewFieldId?: string;
};
