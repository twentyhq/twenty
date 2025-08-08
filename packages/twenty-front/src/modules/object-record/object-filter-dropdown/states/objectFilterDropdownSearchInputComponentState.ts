import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSearchInputComponentState =
  createComponentState<string>({
    key: 'objectFilterDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
