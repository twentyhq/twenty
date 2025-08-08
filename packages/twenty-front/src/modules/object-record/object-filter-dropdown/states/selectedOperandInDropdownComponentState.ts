import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

export const selectedOperandInDropdownComponentState =
  createComponentState<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
