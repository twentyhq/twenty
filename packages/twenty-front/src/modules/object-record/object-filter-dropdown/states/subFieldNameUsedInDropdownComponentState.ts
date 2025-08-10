import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const subFieldNameUsedInDropdownComponentState = createComponentState<
  CompositeFieldSubFieldName | null | undefined
>({
  key: 'subFieldNameUsedInDropdownComponentState',
  defaultValue: null,
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
