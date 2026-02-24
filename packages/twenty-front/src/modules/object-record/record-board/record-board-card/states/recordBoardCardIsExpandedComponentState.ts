import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordBoardCardIsExpandedComponentState =
  createComponentStateV2<boolean>({
    key: 'recordBoardCardIsExpandedComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
