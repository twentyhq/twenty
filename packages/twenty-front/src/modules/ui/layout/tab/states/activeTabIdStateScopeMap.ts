import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const activeTabIdStateScopeMap = createStateScopeMap<string | null>({
  key: 'activeTabIdStateScopeMap',
  defaultValue: null,
});
