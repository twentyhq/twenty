import { FieldDefinition } from '@/ui/Data/Field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';

export type BoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    index: number;
    isVisible?: boolean;
  };
