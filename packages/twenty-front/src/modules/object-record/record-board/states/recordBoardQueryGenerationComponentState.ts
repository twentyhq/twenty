import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Incremented by every initial query so a fetch-more that resolves after a reset can be discarded
export const recordBoardQueryGenerationComponentState =
  createAtomComponentState<number>({
    key: 'recordBoardQueryGenerationComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
