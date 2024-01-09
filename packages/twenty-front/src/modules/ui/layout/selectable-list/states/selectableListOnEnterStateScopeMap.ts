import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const selectableListOnEnterStateScopeMap = createStateScopeMap<
  ((itemId: string) => void) | undefined
>({
  key: 'selectableListOnEnterScopedState',
  defaultValue: undefined,
});
