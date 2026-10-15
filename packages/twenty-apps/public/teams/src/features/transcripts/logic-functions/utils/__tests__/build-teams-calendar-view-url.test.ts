import { describe, expect, it } from 'vitest';

import { buildTeamsCalendarViewUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-calendar-view-url';

describe('buildTeamsCalendarViewUrl', () => {
  it('should select isOnlineMeeting, without which Microsoft Graph returns no Teams provider or join URL', () => {
    const url = buildTeamsCalendarViewUrl({
      startDateTime: '2026-09-01T00:00:00.000Z',
      endDateTime: '2026-10-01T00:00:00.000Z',
    });
    const selectedFields = new URLSearchParams(url.split('?')[1])
      .get('$select')
      ?.split(',');

    expect(selectedFields).toEqual(
      expect.arrayContaining([
        'isOnlineMeeting',
        'onlineMeetingProvider',
        'onlineMeeting',
      ]),
    );
  });
});
