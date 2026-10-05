import { isNonEmptyArray } from 'twenty-shared/utils';

import { TYPE_NAMES } from '../constants';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';
import { getEventListenerSignature } from './get-event-listener-signature';

export const resolveElementEventsType = ({
  hasCommonHtmlEvents,
  customEvents,
}: Pick<
  RemoteElementDescriptor,
  'hasCommonHtmlEvents' | 'customEvents'
>): string => {
  if (!isNonEmptyArray(customEvents)) {
    return hasCommonHtmlEvents
      ? TYPE_NAMES.COMMON_EVENTS
      : TYPE_NAMES.EMPTY_RECORD;
  }

  const customEventListenerSignatures = customEvents
    .map((eventName) => getEventListenerSignature(eventName))
    .join('; ');
  const customEventsType = `{ ${customEventListenerSignatures} }`;

  if (hasCommonHtmlEvents) {
    return `${TYPE_NAMES.COMMON_EVENTS} & ${customEventsType}`;
  }

  return customEventsType;
};
