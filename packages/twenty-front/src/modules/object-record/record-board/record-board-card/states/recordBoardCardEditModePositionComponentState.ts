import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordBoardCardEditModePositionComponentState =
  createAtomComponentState<number | null>({
    key: 'recordBoardCardEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
