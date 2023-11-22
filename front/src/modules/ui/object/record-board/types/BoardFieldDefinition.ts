import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';

export type BoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    position: number;
    isVisible?: boolean;
    viewFieldId?: string;
  };
