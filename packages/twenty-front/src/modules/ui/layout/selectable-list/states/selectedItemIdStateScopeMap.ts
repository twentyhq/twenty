import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const selectedItemIdStateScopeMap = createStateScopeMap<string | null>({
  key: 'selectedItemIdScopedState',
  defaultValue: null,
});
