import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { ViewFilterOperand } from '~/generated/graphql';

export const selectedOperandInDropdownScopedState =
  createScopedState<ViewFilterOperand | null>({
    key: 'selectedOperandInDropdownScopedState',
    defaultValue: null,
  });
