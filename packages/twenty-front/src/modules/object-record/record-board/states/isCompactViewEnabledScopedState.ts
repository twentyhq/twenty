import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isCompactViewEnabledScopedState = createScopedState<boolean>({
  key: 'isCompactViewEnabledScopedState',
  defaultValue: false,
});
