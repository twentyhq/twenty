import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const tableLastRowVisibleStateScopeMap = createStateScopeMap<boolean>({
  key: 'tableLastRowVisibleStateScopeMap',
  defaultValue: false,
});
