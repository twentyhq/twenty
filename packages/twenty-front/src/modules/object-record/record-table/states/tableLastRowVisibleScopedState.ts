import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const tableLastRowVisibleScopedState = createStateScopeMap<boolean>({
  key: 'tableLastRowVisibleScopedState',
  defaultValue: false,
});
