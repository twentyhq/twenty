import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ColumnDefinition } from '../types/ColumnDefinition';

export const tableColumnsComponentState = createComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'tableColumnsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
