import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

export type ColumnDefinition<T extends FieldMetadata> = FieldDefinition<T> & {
  size: number;
  position: number;
  isVisible?: boolean;
  viewFieldId?: string;
};
