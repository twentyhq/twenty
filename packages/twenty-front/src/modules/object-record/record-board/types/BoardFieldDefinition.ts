import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';

export type BoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    position: number;
    isVisible?: boolean;
    viewFieldId?: string;
  };
