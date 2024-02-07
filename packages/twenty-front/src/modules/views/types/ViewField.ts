import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export type ViewField = {
  id: string;
  fieldMetadataId: string;
  position: number;
  isVisible: boolean;
  size: number;
  definition:
    | ColumnDefinition<FieldMetadata>
    | BoardFieldDefinition<FieldMetadata>;
};
