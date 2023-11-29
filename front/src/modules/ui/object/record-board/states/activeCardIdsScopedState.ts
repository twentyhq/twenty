import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const activeCardIdsScopedState = createScopedState<string[]>({
  key: 'activeCardIdsScopedState',
  defaultValue: [],
});
