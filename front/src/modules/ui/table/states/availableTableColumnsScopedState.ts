import { atomFamily } from 'recoil';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsScopedState = atomFamily<
  ColumnDefinition<ViewFieldMetadata>[],
  string
>({
  key: 'availableTableColumnsScopedState',
  default: [],
});
