import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const viewEditModeScopedState = createScopedState<boolean>({
  key: 'viewEditModeScopedState',
  defaultValue: false,
});
