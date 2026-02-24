import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordBoardShouldFetchMoreComponentState =
  createComponentState<boolean>({
    key: 'recordBoardShouldFetchMoreComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
