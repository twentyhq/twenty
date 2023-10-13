import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const savedTableColumnsFamilyState = atomFamily<
  ColumnDefinition<FieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsFamilyState',
  default: [],
});
