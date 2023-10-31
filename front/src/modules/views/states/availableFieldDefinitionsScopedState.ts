import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableFieldDefinitionsScopedState = createScopedState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableFieldDefinitionsScopedState',
  defaultValue: [],
});
