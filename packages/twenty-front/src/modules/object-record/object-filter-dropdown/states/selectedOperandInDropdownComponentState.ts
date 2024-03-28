import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const selectedOperandInDropdownComponentState =
  createComponentState<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownComponentState',
    defaultValue: null,
  });
