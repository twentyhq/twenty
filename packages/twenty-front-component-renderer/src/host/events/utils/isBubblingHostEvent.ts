import { isString } from '@sniptt/guards';

import { REACT_ENTER_LEAVE_EVENT_TYPES } from '@/host/events/constants/ReactEnterLeaveEventTypes';
import { type HostEventDispatchFields } from '@/host/events/types/HostEventDispatchFields';

export const isBubblingHostEvent = (
  hostEvent: HostEventDispatchFields,
): boolean =>
  hostEvent.bubbles === true &&
  isString(hostEvent.type) &&
  !REACT_ENTER_LEAVE_EVENT_TYPES.has(hostEvent.type);
