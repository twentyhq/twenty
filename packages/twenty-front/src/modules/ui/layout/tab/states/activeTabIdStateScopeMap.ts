import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const activeTabIdScopedState = createStateScopeMap<string | null>({
  key: 'activeTabIdScopedState',
  defaultValue: null,
});