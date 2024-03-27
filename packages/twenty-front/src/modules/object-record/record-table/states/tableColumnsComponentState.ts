import { createComponentState } from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsComponentState = createComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'tableColumnsComponentState',
  defaultValue: [],
});
