import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardCardEditModePositionComponentState =
  createComponentState<number | null>({
    key: 'recordBoardCardEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
