import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastRecordGroupIdsComponentState = createAtomComponentState<
  string[]
>({
  key: 'lastRecordGroupIdsComponentState',
  componentInstanceContext: RecordBoardComponentInstanceContext,
  defaultValue: [],
});
