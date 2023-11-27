import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const selectableItemIdsScopeState = createScopedState<string[]>({
  key: 'selectableItemIdsScopeState',
  defaultValue: [],
});
