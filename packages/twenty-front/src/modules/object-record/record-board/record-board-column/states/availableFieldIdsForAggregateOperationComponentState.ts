import { RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext } from '@/object-record/record-board/contexts/RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const availableFieldIdsForAggregateOperationComponentState =
  createComponentState<string[]>({
    key: 'availableFieldIdsForAggregateOperationComponentFamilyState',
    defaultValue: [],
    componentInstanceContext:
      RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext,
  });
