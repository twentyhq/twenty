import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isSoftFocusActiveStateScopeMap = createStateScopeMap<boolean>({
  key: 'isSoftFocusActiveStateScopeMap',
  defaultValue: false,
});
