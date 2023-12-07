import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsScopedState = createScopedState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableTableColumnsScopedState',
  defaultValue: [],
});
