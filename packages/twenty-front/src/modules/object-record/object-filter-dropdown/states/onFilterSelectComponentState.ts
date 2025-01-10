import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { Filter } from '../types/Filter';

export const onFilterSelectComponentState = createComponentStateV2<
  ((filter: Filter | null) => void) | undefined
>({
  key: 'onFilterSelectComponentState',
  defaultValue: undefined,
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
