import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordBoardCardHoverPositionComponentState =
  createAtomComponentState<number | null>({
    key: 'recordBoardCardHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
