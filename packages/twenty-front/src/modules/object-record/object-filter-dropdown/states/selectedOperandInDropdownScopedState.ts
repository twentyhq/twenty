import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const selectedOperandInDropdownScopedState =
  createStateScopeMap<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownScopedState',
    defaultValue: null,
  });
