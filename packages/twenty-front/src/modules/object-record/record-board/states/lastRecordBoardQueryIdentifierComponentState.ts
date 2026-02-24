import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const lastRecordBoardQueryIdentifierComponentState =
  createComponentState<string>({
    key: 'lastRecordBoardQueryIdentifierComponentState',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    defaultValue: '',
  });
