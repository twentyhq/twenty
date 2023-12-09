import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const selectableListOnEnterScopedState = createScopedState<
  ((itemId: string) => void) | undefined
>({
  key: 'selectableListOnEnterScopedState',
  defaultValue: undefined,
});
