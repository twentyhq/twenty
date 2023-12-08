import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const tableLastRowVisibleScopedState = createScopedState<boolean>({
  key: 'tableLastRowVisibleScopedState',
  defaultValue: false,
});
