import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordBoardCardIsExpandedComponentState =
  createAtomComponentState<boolean>({
    key: 'recordBoardCardIsExpandedComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardCardComponentInstanceContext,
  });
