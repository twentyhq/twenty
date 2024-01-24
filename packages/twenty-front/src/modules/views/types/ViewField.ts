import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';
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
