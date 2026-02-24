import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const lastRecordBoardQueryIdentifierComponentState =
  createComponentStateV2<string>({
    key: 'lastRecordBoardQueryIdentifierComponentState',
    componentInstanceContext: RecordBoardComponentInstanceContext,
    defaultValue: '',
  });
