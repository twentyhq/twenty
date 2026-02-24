import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const recordIndexFieldDefinitionsState = createStateV2<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'recordIndexFieldDefinitionsState',
  defaultValue: [],
});
