import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export type ViewField = {
  __typename: 'ViewField';
  id: string;
  fieldMetadataId: string;
  position: number;
  isVisible: boolean;
  size: number;
  definition:
    | ColumnDefinition<FieldMetadata>
    | RecordBoardFieldDefinition<FieldMetadata>;
};
