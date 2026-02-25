import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastRecordBoardQueryIdentifierComponentState =
  createAtomComponentState<string>({
    key: 'lastRecordBoardQueryIdentifierComponentState',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    defaultValue: '',
  });
