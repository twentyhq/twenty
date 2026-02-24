import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const objectFilterDropdownAnyFieldSearchIsSelectedComponentState =
  createComponentState<boolean>({
    key: 'objectFilterDropdownAnyFieldSearchIsSelectedComponentState',
    defaultValue: false,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
