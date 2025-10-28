import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createState } from 'twenty-ui/utilities';

export const recordIndexFieldDefinitionsState = createState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'recordIndexFieldDefinitionsState',
  defaultValue: [],
});
