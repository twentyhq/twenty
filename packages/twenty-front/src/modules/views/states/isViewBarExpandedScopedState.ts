import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isViewBarExpandedScopedState = createScopedState<boolean>({
  key: 'isViewBarExpandedScopedState',
  defaultValue: true,
});
