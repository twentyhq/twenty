import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isDropdownOpenStateScopeMap = createStateScopeMap<boolean>({
  key: 'isDropdownOpenStateScopeMap',
  defaultValue: false,
});
