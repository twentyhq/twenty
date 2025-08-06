import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const availableTableColumnsComponentState = createComponentState<
  ColumnDefinition<FieldMetadata>[]
>({
  key: 'availableTableColumnsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
