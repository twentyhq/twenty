import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const draggedRecordIdsComponentState = createComponentState<string[]>({
  key: 'draggedRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
