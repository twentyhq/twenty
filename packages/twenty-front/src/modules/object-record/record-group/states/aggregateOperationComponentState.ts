import { RecordGroupAggregateDropdownComponentInstanceContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownComponentInstanceContext';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aggregateOperationComponentState =
  createAtomComponentState<ExtendedAggregateOperations | null>({
    key: 'aggregateOperationComponentFamilyState',
    defaultValue: null,
    componentInstanceContext:
      RecordGroupAggregateDropdownComponentInstanceContext,
  });
