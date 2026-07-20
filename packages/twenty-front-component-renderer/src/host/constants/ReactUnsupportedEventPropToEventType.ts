import { type ReactUnsupportedEventType } from '@/host/types/ReactUnsupportedEventType';

// react-dom rejects onFocusIn/onFocusOut as props, so the host binds these
// events with addEventListener instead of letting React attach them.
export const REACT_UNSUPPORTED_EVENT_PROP_TO_EVENT_TYPE: Record<
  string,
  ReactUnsupportedEventType
> = {
  onFocusIn: 'focusin',
  onFocusOut: 'focusout',
};
