import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createState } from '@/ui/utilities/state/utils/createState';

export const recordIndexFieldDefinitionsState = createState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'recordIndexFieldDefinitionsState',
  defaultValue: [],
});
