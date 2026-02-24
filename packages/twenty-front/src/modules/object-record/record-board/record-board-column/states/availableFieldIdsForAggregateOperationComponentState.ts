import { RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext } from '@/object-record/record-board/contexts/RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const availableFieldIdsForAggregateOperationComponentState =
  createComponentStateV2<string[]>({
    key: 'availableFieldIdsForAggregateOperationComponentFamilyState',
    defaultValue: [],
    componentInstanceContext:
      RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext,
  });
