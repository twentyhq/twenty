import { isDefined } from 'twenty-shared/utils';

import { isBubblingHostEvent } from '@/host/events/utils/isBubblingHostEvent';

export const isTargetScrollStateForwardable = (
  domEvent: Record<string, unknown>,
): boolean =>
  isBubblingHostEvent(domEvent) ||
  !isDefined(domEvent.currentTarget) ||
  domEvent.currentTarget === domEvent.target;
