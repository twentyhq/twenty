import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const selectedItemIdScopedState = createScopedState<string | null>({
  key: 'selectedItemIdScopedState',
  defaultValue: null,
});
