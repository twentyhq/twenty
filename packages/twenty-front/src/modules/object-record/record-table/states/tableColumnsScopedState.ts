import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsScopedState = createStateScopeMap<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'tableColumnsScopedState',
  defaultValue: [],
});
