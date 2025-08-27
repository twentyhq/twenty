import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const primaryDraggedRecordIdTableComponentState = createComponentState<
  string | null
>({
  key: 'primaryDraggedRecordIdTableComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
