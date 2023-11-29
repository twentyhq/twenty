import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isBoardLoadedState = createScopedState<boolean>({
  key: 'isBoardLoadedState',
  defaultValue: false,
});
