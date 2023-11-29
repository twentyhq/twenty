import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isBoardLoadedScopedState = createScopedState<boolean>({
  key: 'isBoardLoadedScopedState',
  defaultValue: false,
});
