import { atomFamily } from 'recoil';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const savedTableColumnsFamilyState = atomFamily<
  ColumnDefinition<ViewFieldMetadata>[],
  string | undefined
>({
  key: 'savedTableColumnsFamilyState',
  default: [],
});
