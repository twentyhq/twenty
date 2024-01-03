import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isSoftFocusActiveScopedState = createScopedState<boolean>({
  key: 'isSoftFocusActiveScopedState',
  defaultValue: false,
});
