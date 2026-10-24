import { getTimelineCalendarEventLabel } from '@/activities/calendar/utils/getTimelineCalendarEventLabel';
import { CalendarChannelVisibility } from '~/generated/graphql';

describe('getTimelineCalendarEventLabel', () => {
  it('should return the title when everything is shared', () => {
    expect(
      getTimelineCalendarEventLabel({
        title: 'Renewal review',
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      }),
    ).toBe('Renewal review');
  });

  it('should hide the title when only metadata is shared', () => {
    expect(
      getTimelineCalendarEventLabel({
        title: 'Renewal review',
        visibility: CalendarChannelVisibility.METADATA,
      }),
    ).toBe('Calendar event');
  });
});
