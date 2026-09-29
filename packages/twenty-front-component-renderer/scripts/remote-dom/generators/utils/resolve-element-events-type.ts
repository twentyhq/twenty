import { isNonEmptyArray } from 'twenty-shared/utils';

import { TYPE_NAMES } from '../constants';

export const resolveElementEventsType = ({
  customEvents,
  hasCommonHtmlEvents,
}: {
  customEvents: readonly string[];
  hasCommonHtmlEvents: boolean;
}): string => {
  if (!isNonEmptyArray(customEvents)) {
    return hasCommonHtmlEvents
      ? TYPE_NAMES.COMMON_EVENTS
      : TYPE_NAMES.EMPTY_RECORD;
  }

  const customEventsInline = customEvents
    .map((event) => `${event}(event: Event): void`)
    .join('; ');

  return hasCommonHtmlEvents
    ? `${TYPE_NAMES.COMMON_EVENTS} & { ${customEventsInline} }`
    : `{ ${customEventsInline} }`;
};
