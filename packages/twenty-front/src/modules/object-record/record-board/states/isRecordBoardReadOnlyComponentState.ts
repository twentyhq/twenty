import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isRecordBoardReadOnlyComponentState =
  createAtomComponentState<boolean>({
    key: 'isRecordBoardReadOnlyComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
