import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isObjectFilterDropdownOperandSelectUnfoldedComponentState =
  createComponentState<boolean>({
    key: 'isObjectFilterDropdownOperandSelectUnfoldedComponentState',
    defaultValue: false,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
