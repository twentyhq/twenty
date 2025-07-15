import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

export const selectedOperandInDropdownComponentState =
  createComponentStateV2<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
