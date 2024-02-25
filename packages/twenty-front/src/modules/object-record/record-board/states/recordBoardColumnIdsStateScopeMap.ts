import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardColumnIdsStateScopeMap = createStateScopeMap<string[]>({
  key: 'recordBoardColumnIdsStateScopeMap',
  defaultValue: [],
});
