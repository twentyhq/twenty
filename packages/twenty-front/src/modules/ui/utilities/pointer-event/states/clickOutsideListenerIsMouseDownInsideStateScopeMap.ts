import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const clickOutsideListenerIsMouseDownInsideStateScopeMap =
  createStateScopeMap<boolean>({
    key: 'clickOutsideListenerIsMouseDownInsideStateScopeMap',
    defaultValue: false,
  });
