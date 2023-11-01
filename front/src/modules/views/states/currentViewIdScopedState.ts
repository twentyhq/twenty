import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const currentViewIdScopedState = createScopedState<string | undefined>({
  key: 'currentViewIdScopedState',
  defaultValue: undefined,
});
