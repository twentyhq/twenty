import { createState } from "twenty-shared";

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export const recordIndexFieldDefinitionsState = createState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'recordIndexFieldDefinitionsState',
  defaultValue: [],
});
