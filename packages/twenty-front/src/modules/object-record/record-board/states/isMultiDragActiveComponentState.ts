import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isMultiDragActiveComponentState = createComponentStateV2<boolean>({
  key: 'isMultiDragActiveComponentState',
  defaultValue: false,
  componentInstanceContext: RecordBoardComponentInstanceContext,
});
