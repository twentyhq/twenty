import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  CalendarChannelVisibility,
  type TimelineCalendarEvent,
} from '~/generated/graphql';

export const getTimelineCalendarEventLabel = (
  calendarEvent: Pick<TimelineCalendarEvent, 'title' | 'visibility'>,
) =>
  calendarEvent.visibility === CalendarChannelVisibility.SHARE_EVERYTHING &&
  isNonEmptyString(calendarEvent.title)
    ? calendarEvent.title
    : t`Calendar event`;
