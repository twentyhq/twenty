import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type TimelineActivityRenderer } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

const getLegacyTimelineActivityRenderer = (
  linkedObjectNameSingular: string | undefined,
): TimelineActivityRenderer => {
  switch (linkedObjectNameSingular) {
    case CoreObjectNameSingular.Note:
    case CoreObjectNameSingular.Task:
      return 'activity';
    case CoreObjectNameSingular.Message:
      return 'message';
    case CoreObjectNameSingular.CalendarEvent:
      return 'calendarEvent';
    default:
      return isDefined(linkedObjectNameSingular)
        ? 'genericLinked'
        : 'mainObject';
  }
};

export const getTimelineActivityRenderer = ({
  eventRenderer,
  legacyName,
  linkedObjectNameSingular,
}: {
  eventRenderer: TimelineActivityRenderer | null;
  legacyName: string | null;
  linkedObjectNameSingular: string | undefined;
}): TimelineActivityRenderer => {
  if (isDefined(eventRenderer)) {
    return eventRenderer;
  }

  // The legacy name is the remaining renderer hint when its type is removed.
  if (isDefined(legacyName)) {
    return getLegacyTimelineActivityRenderer(linkedObjectNameSingular);
  }

  return isDefined(linkedObjectNameSingular) ? 'genericLinked' : 'mainObject';
};
