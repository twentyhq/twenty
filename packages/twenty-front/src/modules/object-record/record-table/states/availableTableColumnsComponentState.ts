import { createComponentState } from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsComponentState = createComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableTableColumnsComponentState',
  defaultValue: [],
});
