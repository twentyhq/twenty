import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const resizeFieldOffsetScopedState = createStateScopeMap<number>({
  key: 'resizeFieldOffsetScopedState',
  defaultValue: 0,
});
