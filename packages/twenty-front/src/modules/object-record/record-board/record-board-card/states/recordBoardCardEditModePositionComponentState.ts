import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordBoardCardEditModePositionComponentState =
  createComponentStateV2<number | null>({
    key: 'recordBoardCardEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
