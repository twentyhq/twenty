import { afterEach, describe, expect, it, vi } from 'vitest';

const { openSidePanelPage } = vi.hoisted(() => ({
  openSidePanelPage: vi.fn(() => Promise.resolve()),
}));

vi.mock('twenty-sdk/front-component', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/front-component')>()),
  openSidePanelPage,
}));

import { SidePanelPages } from 'twenty-sdk/front-component';

import { openCallRecordingCalendarEvent } from 'src/front-components/utils/open-call-recording-calendar-event.util';

describe('openCallRecordingCalendarEvent', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens the meeting the recording belongs to', async () => {
    await openCallRecordingCalendarEvent({
      id: 'call-recording-id',
      calendarEventId: 'calendar-event-id',
    });

    expect(openSidePanelPage).toHaveBeenCalledWith({
      page: SidePanelPages.ViewRecord,
      objectNameSingular: 'calendarEvent',
      recordId: 'calendar-event-id',
    });
  });

  it.each([null, undefined, ''])(
    'opens the recording itself when it has no meeting (%s)',
    async (calendarEventId) => {
      await openCallRecordingCalendarEvent({
        id: 'call-recording-id',
        calendarEventId,
      });

      expect(openSidePanelPage).toHaveBeenCalledWith({
        page: SidePanelPages.ViewRecord,
        objectNameSingular: 'callRecording',
        recordId: 'call-recording-id',
      });
    },
  );
});
