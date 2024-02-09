import { ClickOutsideListenerCallback } from '@/ui/utilities/pointer-event/types/ClickOutsideListenerCallback';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const clickOutsideListenerCallbacksStateScopeMap = createStateScopeMap<
  ClickOutsideListenerCallback[]
>({
  key: 'clickOutsideListenerCallbacksStateScopeMap',
  defaultValue: [],
});
