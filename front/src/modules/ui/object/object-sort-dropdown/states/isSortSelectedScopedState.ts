import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isSortSelectedScopedState = createScopedState<boolean>({
  key: 'isSortSelectedScopedState',
  defaultValue: false,
});
