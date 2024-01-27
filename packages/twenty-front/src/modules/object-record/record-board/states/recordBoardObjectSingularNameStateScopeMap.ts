import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardObjectSingularNameStateScopeMap = createStateScopeMap<
  string | undefined
>({
  key: 'recordBoardObjectSingularNameStateScopeMap',
  defaultValue: undefined,
});
