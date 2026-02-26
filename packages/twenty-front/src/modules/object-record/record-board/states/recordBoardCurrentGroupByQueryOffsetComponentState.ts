import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordBoardCurrentGroupByQueryOffsetComponentState =
  createAtomComponentState<number>({
    key: 'recordBoardCurrentGroupByQueryOffsetComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
