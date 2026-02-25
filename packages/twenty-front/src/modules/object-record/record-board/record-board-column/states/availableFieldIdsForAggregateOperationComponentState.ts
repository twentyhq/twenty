import { RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext } from '@/object-record/record-board/contexts/RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const availableFieldIdsForAggregateOperationComponentState =
  createAtomComponentState<string[]>({
    key: 'availableFieldIdsForAggregateOperationComponentFamilyState',
    defaultValue: [],
    componentInstanceContext:
      RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext,
  });
