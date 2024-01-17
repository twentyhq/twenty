import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const clickOutsideListenerIsEnabledStateScopeMap =
  createStateScopeMap<boolean>({
    key: 'clickOutsideListenerIsEnabledStateScopeMap',
    defaultValue: true,
  });
