import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ViewFilterOperand } from 'twenty-shared/types';

export const selectedOperandInDropdownComponentState =
  createComponentState<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
