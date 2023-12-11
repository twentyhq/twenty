import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableFieldDefinitionsScopedState = createScopedState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableFieldDefinitionsScopedState',
  defaultValue: [],
});
