import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardCardIsExpandedComponentState =
  createComponentState<boolean>({
    key: 'recordBoardCardIsExpandedComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
