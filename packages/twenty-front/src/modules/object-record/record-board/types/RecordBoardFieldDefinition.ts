import { type FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

export type RecordBoardFieldDefinition<T extends FieldMetadata> =
  FieldDefinition<T> & {
    viewFieldId?: string;
    position: number;
    isVisible?: boolean;
    isLabelIdentifier?: boolean;
  };
