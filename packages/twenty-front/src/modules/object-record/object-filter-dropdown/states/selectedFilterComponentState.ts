import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { Filter } from '../types/Filter';

export const selectedFilterComponentState = createComponentStateV2<
  Filter | undefined | null
>({
  key: 'selectedFilterComponentState',
  defaultValue: undefined,
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
