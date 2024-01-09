import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const selectableItemIdsStateScopeMap = createStateScopeMap<string[][]>({
  key: 'selectableItemIdsScopedState',
  defaultValue: [[]],
});
