import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Bound per record board: the context store instance is global, so this
// in-flight flag leaked between boards
export const recordIndexRecordGroupsAreInInitialLoadingComponentState =
  createAtomComponentState<boolean>({
    key: 'recordIndexRecordGroupsAreInInitialLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
