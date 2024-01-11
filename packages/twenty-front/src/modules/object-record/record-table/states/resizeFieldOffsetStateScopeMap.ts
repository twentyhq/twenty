import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const resizeFieldOffsetStateScopeMap = createStateScopeMap<number>({
  key: 'resizeFieldOffsetStateScopeMap',
  defaultValue: 0,
});
