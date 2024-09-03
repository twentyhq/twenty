import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const availableFieldDefinitionsInstanceState = createInstanceState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableFieldDefinitionsInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
