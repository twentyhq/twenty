import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsScopedState = createStateScopeMap<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableTableColumnsScopedState',
  defaultValue: [],
});
