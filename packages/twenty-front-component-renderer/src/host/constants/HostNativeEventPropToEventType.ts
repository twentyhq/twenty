import { type HostNativeEventType } from '@/host/types/HostNativeEventType';

export const HOST_NATIVE_EVENT_PROP_TO_EVENT_TYPE: Record<
  string,
  HostNativeEventType
> = {
  onFocusIn: 'focusin',
  onFocusOut: 'focusout',
};
