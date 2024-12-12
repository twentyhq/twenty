import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export type ColumnDefinition<T extends FieldMetadata> = FieldDefinition<T> & {
  size: number;
  position: number;
  isLabelIdentifier?: boolean;
  isVisible?: boolean;
  viewFieldId?: string;
  isFilterable?: boolean;
  isSortable?: boolean;
  aggregateOperation?: AGGREGATE_OPERATIONS | null;
};
