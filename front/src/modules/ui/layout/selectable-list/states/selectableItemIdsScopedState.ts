import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const selectableItemIdsScopedState = createScopedState<string[][]>({
  key: 'selectableItemIdsScopedState',
  defaultValue: [[]],
});
