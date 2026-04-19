import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const iSsoftDeleteFilterActiveComponentState =
  createAtomComponentState<boolean>({
    key: 'iSsoftDeleteFilterActiveComponentState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
