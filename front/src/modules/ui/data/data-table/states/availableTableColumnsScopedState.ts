import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsScopedState = atomFamily<
  ColumnDefinition<FieldMetadata>[],
  string
>({
  key: 'availableTableColumnsScopedState',
  default: [],
});
