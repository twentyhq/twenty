import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const tableRowIdsScopedState = createScopedState<string[]>({
  key: 'tableRowIdsScopedState',
  defaultValue: [],
});
