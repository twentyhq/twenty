import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES } from 'src/logic-functions/constants/deferred-recall-bot-deletion-min-lead-minutes';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:00:00.000Z');
const FAR_MEETING_STARTS_AT = '2026-01-02T09:00:00.000Z';
const RECALL_BOT_URL = 'https://us-west-2.recall.ai/api/v1/bot/recall-bot-1/';

type CallRecordingNode = Record<string, unknown> & { id: string };

class FakeCoreApiClient {
  callRecording: CallRecordingNode;

  constructor(callRecording: CallRecordingNode) {
    this.callRecording = callRecording;
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecording !== undefined) {
      Object.assign(
        this.callRecording,
        mutation.updateCallRecording.__args.data,
      );

      return { updateCallRecording: { id: this.callRecording.id } };
    }

    if (mutation.updateCallRecordings !== undefined) {
      Object.assign(
        this.callRecording,
        mutation.updateCallRecordings.__args.data,
      );

      return { updateCallRecordings: [{ id: this.callRecording.id }] };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }
}

const buildCalendarEvent = (startsAt: string): CalendarEventRecord => ({
  id: 'calendar-event-1',
  title: 'Customer sync',
  isCanceled: false,
  startsAt,
  endsAt: undefined,
  iCalUid: undefined,
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  callRecorderPreference: 'OFF',
});

const buildCallRecording = (startsAt: string): CallRecordingRecord => ({
  id: computeCallRecordingIdForMeeting(
    `link:meet.example.com/customer-sync:${startsAt}`,
  ),
  status: 'SCHEDULED',
  recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
  calendarEventId: 'calendar-event-1',
  externalBotId: 'recall-bot-1',
});

const cancel = async ({
  meetingStartsAt,
  isRecallBotDeletionDeferralEnabled,
}: {
  meetingStartsAt: string;
  isRecallBotDeletionDeferralEnabled: () => Promise<boolean>;
}) => {
  const callRecording = buildCallRecording(meetingStartsAt);
  const client = new FakeCoreApiClient({ ...callRecording });

  await cancelCallRecordingRequest({
    client: client as unknown as CoreApiClient,
    callRecording,
    calendarEvent: buildCalendarEvent(meetingStartsAt),
    isRecallBotDeletionDeferralEnabled,
    now: NOW,
  });

  return client.callRecording;
};

describe('cancelCallRecordingRequest', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async () => new Response(null, { status: 204 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('leaves the bot of a far meeting to the follow-up when deferral is enabled', async () => {
    const callRecording = await cancel({
      meetingStartsAt: FAR_MEETING_STARTS_AT,
      isRecallBotDeletionDeferralEnabled: async () => true,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(callRecording).toMatchObject({
      recordingRequestStatus: 'CANCELED',
      externalBotId: 'recall-bot-1',
    });
  });

  it('deletes the bot right away once its deletion window has come', async () => {
    const callRecording = await cancel({
      meetingStartsAt: new Date(
        NOW.getTime() +
          DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES *
            MILLISECONDS_PER_MINUTE,
      ).toISOString(),
      isRecallBotDeletionDeferralEnabled: async () => true,
    });

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(callRecording).toMatchObject({
      recordingRequestStatus: 'CANCELED',
      externalBotId: null,
    });
  });

  it('deletes the bot of a far meeting right away when deferral is disabled', async () => {
    const callRecording = await cancel({
      meetingStartsAt: FAR_MEETING_STARTS_AT,
      isRecallBotDeletionDeferralEnabled: async () => false,
    });

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(callRecording).toMatchObject({
      recordingRequestStatus: 'CANCELED',
      externalBotId: null,
    });
  });

  it('deletes the bot right away without reading the flag when the meeting time is unknown', async () => {
    const isRecallBotDeletionDeferralEnabled = vi.fn(async () => true);
    const callRecording = buildCallRecording(FAR_MEETING_STARTS_AT);
    const client = new FakeCoreApiClient({ ...callRecording });

    await cancelCallRecordingRequest({
      client: client as unknown as CoreApiClient,
      callRecording,
      calendarEvent: undefined,
      isRecallBotDeletionDeferralEnabled,
      now: NOW,
    });

    expect(isRecallBotDeletionDeferralEnabled).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
