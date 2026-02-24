import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isSoftDeleteFilterActiveComponentState =
  createComponentState<boolean>({
    key: 'isSoftDeleteFilterActiveComponentState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
