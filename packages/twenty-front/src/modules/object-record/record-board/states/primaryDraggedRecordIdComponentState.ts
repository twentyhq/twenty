import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const primaryDraggedRecordIdComponentState = createComponentState<
  string | null
>({
  key: 'primaryDraggedRecordIdComponentState',
  defaultValue: null,
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
