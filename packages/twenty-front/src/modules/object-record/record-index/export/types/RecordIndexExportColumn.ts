import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export type RecordIndexExportColumn = Pick<
  ColumnDefinition<FieldMetadata>,
  'label' | 'type' | 'metadata' | 'relationTraversal'
>;
