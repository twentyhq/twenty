import { atomFamily } from 'recoil';

import { type ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { type ColumnDefinition } from '../types/ColumnDefinition';

export const savedTableColumnsFamilyState = atomFamily<
  ColumnDefinition<ViewFieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsFamilyState',
  default: [],
});
