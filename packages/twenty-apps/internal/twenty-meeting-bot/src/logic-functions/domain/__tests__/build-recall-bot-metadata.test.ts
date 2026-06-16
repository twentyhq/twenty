import { afterEach, describe, expect, it } from 'vitest';

import { buildRecallBotMetadata } from 'src/logic-functions/domain/build-recall-bot-metadata.util';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';

const buildMeetingRecording = (): MeetingRecording =>
  ({
    callRecording: {
      id: 'call-recording-id',
    },
    calendarEvent: {
      id: 'calendar-event-id',
      conferenceLinkUrl: 'https://meet.example.com/customer-sync',
      iCalUid: 'ical-uid',
      startsAt: '2026-01-01T13:00:00.000Z',
    },
  }) as MeetingRecording;

describe('buildRecallBotMetadata', () => {
  afterEach(() => {
    delete process.env.APPLICATION_ID;
    delete process.env.WORKSPACE_ID;
  });

  it('stamps workspace and application ids when they are available', () => {
    process.env.APPLICATION_ID = 'application-id';
    process.env.WORKSPACE_ID = 'workspace-id';

    expect(buildRecallBotMetadata(buildMeetingRecording())).toMatchObject({
      twentyWorkspaceId: 'workspace-id',
      twentyApplicationId: 'application-id',
      twentyCallRecordingId: 'call-recording-id',
      twentyCalendarEventId: 'calendar-event-id',
    });
  });

  it('keeps metadata buildable when execution context ids are unavailable', () => {
    const metadata = buildRecallBotMetadata(buildMeetingRecording());

    expect(metadata).toMatchObject({
      twentyCallRecordingId: 'call-recording-id',
      twentyCalendarEventId: 'calendar-event-id',
    });
    expect(metadata).not.toHaveProperty('twentyApplicationId');
    expect(metadata).not.toHaveProperty('twentyWorkspaceId');
  });
});
