import { RecordGroupAggregateDropdownComponentInstanceContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const availableFieldIdsForAggregateOperationComponentState =
  createAtomComponentState<string[]>({
    key: 'availableFieldIdsForAggregateOperationComponentFamilyState',
    defaultValue: [],
    componentInstanceContext:
      RecordGroupAggregateDropdownComponentInstanceContext,
  });
