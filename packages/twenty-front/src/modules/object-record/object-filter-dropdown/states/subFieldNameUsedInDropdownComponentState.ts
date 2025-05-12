import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const subFieldNameUsedInDropdownComponentState = createComponentStateV2<
  CompositeFieldSubFieldName | null | undefined
>({
  key: 'subFieldNameUsedInDropdownComponentState',
  defaultValue: null,
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
