import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordBoardCurrentGroupByQueryOffsetComponentState =
  createComponentStateV2<number>({
    key: 'recordBoardCurrentGroupByQueryOffsetComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
