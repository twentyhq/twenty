import { atomFamily } from 'recoil';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../types/ColumnDefinition';

export const savedTableColumnsScopedState = atomFamily<
  ColumnDefinition<ViewFieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsScopedState',
  default: [],
});
