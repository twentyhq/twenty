import { ClickOutsideListenerCallbackFunction } from '@/ui/utilities/pointer-event/types/ClickOutsideListenerCallbackFunction';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export type ClickOutsideListenerCallback = {
  callbackId: string;
  callbackFunction: ClickOutsideListenerCallbackFunction;
};

export const clickOutsideListenerCallbacksStateScopeMap = createStateScopeMap<
  ClickOutsideListenerCallback[]
>({
  key: 'clickOutsideListenerCallbacksStateScopeMap',
  defaultValue: [],
});
