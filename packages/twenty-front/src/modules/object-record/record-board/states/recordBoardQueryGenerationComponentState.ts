import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordBoardQueryGenerationComponentState =
  createAtomComponentState<number>({
    key: 'recordBoardQueryGenerationComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
