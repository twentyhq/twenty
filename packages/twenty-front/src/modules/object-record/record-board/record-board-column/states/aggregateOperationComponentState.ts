import { RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext } from '@/object-record/record-board/contexts/RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const aggregateOperationComponentState =
  createComponentState<ExtendedAggregateOperations | null>({
    key: 'aggregateOperationComponentFamilyState',
    defaultValue: null,
    componentInstanceContext:
      RecordBoardColumnHeaderAggregateDropdownComponentInstanceContext,
  });
