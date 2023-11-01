import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const viewObjectIdScopeState = createScopedState<string | undefined>({
  key: 'viewObjectIdScopeState',
  defaultValue: undefined,
});
