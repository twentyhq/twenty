import { isDefined } from 'twenty-shared/utils';

import { type HostEventDispatchFields } from '@/host/events/types/HostEventDispatchFields';
import { isBubblingHostEvent } from '@/host/events/utils/isBubblingHostEvent';

export const isTargetScrollStateForwardable = (
  domEvent: HostEventDispatchFields & { currentTarget?: unknown },
): boolean =>
  isBubblingHostEvent(domEvent) ||
  !isDefined(domEvent.currentTarget) ||
  domEvent.currentTarget === domEvent.target;
