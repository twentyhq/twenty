import { type RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export type ViewField = {
  __typename: 'ViewField';
  id: string;
  fieldMetadataId: string;
  position: number;
  isVisible: boolean;
  size: number;
  aggregateOperation?: AggregateOperations | null;
  definition:
    | ColumnDefinition<FieldMetadata>
    | RecordBoardFieldDefinition<FieldMetadata>;
};
