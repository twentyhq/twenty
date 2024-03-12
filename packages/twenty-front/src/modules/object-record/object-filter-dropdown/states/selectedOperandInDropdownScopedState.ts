import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const selectedOperandInDropdownScopedState =
  createComponentState<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownScopedState',
    defaultValue: null,
  });
