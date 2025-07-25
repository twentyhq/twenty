import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const originalSelectionComponentState = createComponentStateV2<string[]>(
  {
    key: 'originalSelectionComponentState',
    defaultValue: [],
    componentInstanceContext: RecordBoardComponentInstanceContext,
  },
);
