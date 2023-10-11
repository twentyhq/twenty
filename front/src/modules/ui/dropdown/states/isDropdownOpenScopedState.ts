import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isDropdownOpenScopedState = createScopedState<boolean>({
  key: 'isDropdownOpenScopedState',
  defaultValue: false,
});
