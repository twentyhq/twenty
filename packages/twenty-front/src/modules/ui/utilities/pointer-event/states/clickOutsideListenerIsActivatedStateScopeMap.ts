import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const clickOutsideListenerIsActivatedStateScopeMap =
  createStateScopeMap<boolean>({
    key: 'clickOutsideListenerIsActivatedStateScopeMap',
    defaultValue: true,
  });
