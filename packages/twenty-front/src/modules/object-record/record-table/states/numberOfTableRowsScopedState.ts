import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const numberOfTableRowsScopedState = createStateScopeMap<number>({
  key: 'numberOfTableRowsScopedState',
  defaultValue: 0,
});
