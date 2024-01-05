import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isSortSelectedScopedState = createStateScopeMap<boolean>({
  key: 'isSortSelectedScopedState',
  defaultValue: false,
});
