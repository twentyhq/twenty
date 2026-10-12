import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const draggedRecordIdsComponentState = createAtomComponentState<
  string[]
>({
  key: 'draggedRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordSelectionComponentInstanceContext,
});
