import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableFieldsScopedState = createScopedState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableFieldsScopedState',
  defaultValue: [],
});
