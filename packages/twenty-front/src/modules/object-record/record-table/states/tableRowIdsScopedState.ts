import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const tableRowIdsScopedState = createStateScopeMap<string[]>({
  key: 'tableRowIdsScopedState',
  defaultValue: [],
});
