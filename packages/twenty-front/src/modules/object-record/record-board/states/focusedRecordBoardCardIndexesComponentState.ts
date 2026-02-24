import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const focusedRecordBoardCardIndexesComponentState =
  createComponentStateV2<BoardCardIndexes | null>({
    key: 'focusedRecordBoardCardIndexesComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
