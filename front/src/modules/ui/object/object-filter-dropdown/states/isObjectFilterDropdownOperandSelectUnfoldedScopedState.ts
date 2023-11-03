import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isObjectFilterDropdownOperandSelectUnfoldedScopedState =
  createScopedState<boolean>({
    key: 'isObjectFilterDropdownOperandSelectUnfoldedScopedState',
    defaultValue: false,
  });
