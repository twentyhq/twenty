import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const activeRecordBoardCardIndexesComponentState =
  createComponentState<BoardCardIndexes | null>({
    key: 'activeRecordBoardCardIndexesComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
