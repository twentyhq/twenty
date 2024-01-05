import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isDropdownOpenScopedState = createStateScopeMap<boolean>({
  key: 'isDropdownOpenScopedState',
  defaultValue: false,
});
