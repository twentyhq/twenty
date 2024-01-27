import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';

export type RecordBoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    viewFieldId?: string;
    position: number;
    isVisible?: boolean;
  };
