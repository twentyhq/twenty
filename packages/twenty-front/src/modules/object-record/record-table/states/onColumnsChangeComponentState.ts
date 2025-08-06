import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onColumnsChangeComponentState = createComponentState<
  ((columns: ColumnDefinition<FieldMetadata>[]) => void) | undefined
>({
  key: 'onColumnsChangeComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
