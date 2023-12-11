import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const viewEditModeScopedState = createScopedState<
  'none' | 'edit' | 'create'
>({
  key: 'viewEditModeScopedState',
  defaultValue: 'none',
});
