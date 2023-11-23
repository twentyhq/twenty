import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isPersistingViewScopedState = createScopedState<boolean>({
  key: 'isPersistingViewScopedState',
  defaultValue: false,
});
