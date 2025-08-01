import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const primaryDraggedRecordIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'primaryDraggedRecordIdComponentState',
  defaultValue: null,
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
