import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const numberOfTableRowsStateScopeMap = createStateScopeMap<number>({
  key: 'numberOfTableRowsStateScopeMap',
  defaultValue: 0,
});
