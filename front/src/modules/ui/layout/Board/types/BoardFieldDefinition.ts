import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

export type BoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    index: number;
    isVisible?: boolean;
  };
