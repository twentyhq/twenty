import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const tableRowIdsStateScopeMap = createStateScopeMap<string[]>({
  key: 'tableRowIdsStateScopeMap',
  defaultValue: [],
});
