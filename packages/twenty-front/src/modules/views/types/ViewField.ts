import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

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
