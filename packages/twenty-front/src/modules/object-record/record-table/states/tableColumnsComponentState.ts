import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsComponentState = createComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'tableColumnsComponentState',
  defaultValue: [],
});
