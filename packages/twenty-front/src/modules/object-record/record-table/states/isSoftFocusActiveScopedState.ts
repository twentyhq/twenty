import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isSoftFocusActiveScopedState = createStateScopeMap<boolean>({
  key: 'isSoftFocusActiveScopedState',
  defaultValue: false,
});
