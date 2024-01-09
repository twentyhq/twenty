import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isPersistingViewScopedState = createStateScopeMap<boolean>({
  key: 'isPersistingViewScopedState',
  defaultValue: false,
});
