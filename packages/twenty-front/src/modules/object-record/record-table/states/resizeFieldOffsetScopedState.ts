import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const resizeFieldOffsetScopedState = createScopedState<number>({
  key: 'resizeFieldOffsetScopedState',
  defaultValue: 0,
});
