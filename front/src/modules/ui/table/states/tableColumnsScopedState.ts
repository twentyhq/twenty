import { atomFamily } from 'recoil';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsScopedState = atomFamily<
  ColumnDefinition<ViewFieldMetadata>[],
  string
>({
  key: 'tableColumnsScopedState',
  default: [],
});
