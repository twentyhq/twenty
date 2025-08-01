import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const draggedRecordIdsComponentState = createComponentStateV2<string[]>({
  key: 'draggedRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
