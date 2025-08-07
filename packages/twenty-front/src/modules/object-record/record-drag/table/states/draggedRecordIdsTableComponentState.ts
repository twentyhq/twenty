import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const draggedRecordIdsTableComponentState = createComponentState<
  string[]
>({
  key: 'draggedRecordIdsTableComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
