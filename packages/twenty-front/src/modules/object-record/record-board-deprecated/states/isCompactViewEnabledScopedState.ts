import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isCompactViewEnabledScopedState = createStateScopeMap<boolean>({
  key: 'isCompactViewEnabledScopedState',
  defaultValue: false,
});
