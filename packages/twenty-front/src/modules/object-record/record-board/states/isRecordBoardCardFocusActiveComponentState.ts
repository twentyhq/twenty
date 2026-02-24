import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isRecordBoardCardFocusActiveComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordBoardCardFocusActiveComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
