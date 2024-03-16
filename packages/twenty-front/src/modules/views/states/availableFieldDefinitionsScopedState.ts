import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const availableFieldDefinitionsScopedState = createComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableFieldDefinitionsScopedState',
  defaultValue: [],
});
