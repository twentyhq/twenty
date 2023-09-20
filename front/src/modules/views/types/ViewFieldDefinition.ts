import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

export type ViewFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    size: number;
    index: number;
    isVisible?: boolean;
  };
