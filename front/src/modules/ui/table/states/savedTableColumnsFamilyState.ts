import { atomFamily } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ColumnDefinition } from '../types/ColumnDefinition';

export const savedTableColumnsFamilyState = atomFamily<
  ColumnDefinition<FieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsFamilyState',
  default: [],
});
