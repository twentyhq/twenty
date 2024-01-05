import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const viewEditModeScopedState = createStateScopeMap<
  'none' | 'edit' | 'create'
>({
  key: 'viewEditModeScopedState',
  defaultValue: 'none',
});
