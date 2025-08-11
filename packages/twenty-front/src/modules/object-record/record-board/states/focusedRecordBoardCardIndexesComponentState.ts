import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { type BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const focusedRecordBoardCardIndexesComponentState =
  createComponentState<BoardCardIndexes | null>({
    key: 'focusedRecordBoardCardIndexesComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
