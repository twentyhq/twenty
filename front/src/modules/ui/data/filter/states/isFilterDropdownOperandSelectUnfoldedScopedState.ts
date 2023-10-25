import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isFilterDropdownOperandSelectUnfoldedScopedState =
  createScopedState<boolean>({
    key: 'isFilterDropdownOperandSelectUnfoldedScopedState',
    defaultValue: false,
  });
