import { CHECKED_STATE_SETTLED_EVENT_TYPES } from '@/host/events/constants/CheckedStateSettledEventTypes';

export const FORM_CONTROL_VALUE_SETTLED_EVENT_TYPES: ReadonlySet<string> =
  new Set([...CHECKED_STATE_SETTLED_EVENT_TYPES, 'keyup']);
