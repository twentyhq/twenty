import { type ReactUnsupportedEventType } from '@/host/types/ReactUnsupportedEventType';

export const REACT_UNSUPPORTED_EVENT_PROP_TO_EVENT_TYPE: Record<
  string,
  ReactUnsupportedEventType
> = {
  onBeforeInput: 'beforeinput',
  onFocusIn: 'focusin',
  onFocusOut: 'focusout',
};
