import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isObjectFilterDropdownUnfoldedScopedState =
  createScopedState<boolean>({
    key: 'isObjectFilterDropdownUnfoldedScopedState',
    defaultValue: false,
  });
