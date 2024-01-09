import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isViewBarExpandedScopedState = createStateScopeMap<boolean>({
  key: 'isViewBarExpandedScopedState',
  defaultValue: true,
});
