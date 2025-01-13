import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const advancedFilterViewFilterIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'advancedFilterViewFilterIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
