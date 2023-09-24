import { atomFamily } from 'recoil';

import { type ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { type ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsScopedState = atomFamily<
  ColumnDefinition<ViewFieldMetadata>[],
  string
>({
  key: 'tableColumnsScopedState',
  default: [],
});
