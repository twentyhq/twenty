import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const selectedOperandInDropdownScopedState =
  createScopedState<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownScopedState',
    defaultValue: null,
  });
