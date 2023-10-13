import { FieldDefinition } from '@/ui/Data/Field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';

export type ColumnDefinition<T extends FieldMetadata> = FieldDefinition<T> & {
  size: number;
  index: number;
  isVisible?: boolean;
};
