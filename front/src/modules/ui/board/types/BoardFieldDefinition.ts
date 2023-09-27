import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

export type BoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    index: number;
    isVisible?: boolean;
  };
