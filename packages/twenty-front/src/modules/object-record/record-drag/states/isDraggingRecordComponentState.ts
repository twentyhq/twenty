import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isDraggingRecordComponentState = createAtomComponentState<boolean>(
  {
    key: 'isDraggingRecordComponentState',
    defaultValue: false,
    componentInstanceContext: RecordSelectionComponentInstanceContext,
  },
);
