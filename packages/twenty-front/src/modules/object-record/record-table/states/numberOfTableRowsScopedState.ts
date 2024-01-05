import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const numberOfTableRowsScopedState = createScopedState<number>({
  key: 'numberOfTableRowsScopedState',
  defaultValue: 0,
});
