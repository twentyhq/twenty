import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsScopedState = atomFamily<
  ColumnDefinition<FieldMetadata>[],
  string
>({
  key: 'availableTableColumnsScopedState',
  default: [],
});
