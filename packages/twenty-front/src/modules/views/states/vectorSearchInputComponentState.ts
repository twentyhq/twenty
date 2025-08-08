import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const vectorSearchInputComponentState = createComponentState<string>({
  key: 'vectorSearchInputComponentState',
  defaultValue: '',
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
