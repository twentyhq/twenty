import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { BoardCardIndexes } from '@/object-record/record-board/types/BoardCardIndexes';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const focusedBoardCardIndexesComponentState =
  createComponentStateV2<BoardCardIndexes | null>({
    key: 'focusedBoardCardIndexesComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
