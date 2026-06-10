import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  rescheduleRecallRecordingBot,
  scheduleRecallRecordingBot,
} from 'src/logic-functions/utils/recall-bot-api.util';

const getRecallApiConfigMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/get-recall-api-config.util', () => ({
  getRecallApiConfig: getRecallApiConfigMock,
}));

describe('recall bot api', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    getRecallApiConfigMock.mockReset();
    getRecallApiConfigMock.mockReturnValue({
      success: true,
      config: {
        apiKey: 'recall-api-key',
        baseUrl: 'https://ap-northeast-1.recall.ai/api/v1',
        botName: 'Twenty Recall Bot',
      },
    });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'recall-bot-id' }),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  it('creates Recall bot requests with the Token authorization scheme', async () => {
    const result = await scheduleRecallRecordingBot({
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-01T13:00:00.000Z',
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(result).toEqual({ ok: true, externalBotId: 'recall-bot-id' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/bot/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Token recall-api-key',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('fails when the create response does not include a bot id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({}),
    });

    const result = await scheduleRecallRecordingBot({
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-01T13:00:00.000Z',
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(result).toEqual({
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a bot but the response did not include a bot id',
    });
  });

  it('reports the HTTP status when rescheduling a bot that no longer exists', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not found.' }),
    });

    const result = await rescheduleRecallRecordingBot({
      externalBotId: 'recall-bot-gone',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-01T13:00:00.000Z',
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(result).toEqual({
      ok: false,
      status: 404,
      errorMessage:
        'Recall API responded with HTTP 404: {"detail":"Not found."}',
    });
  });

  it('does not duplicate an existing Token authorization prefix', async () => {
    getRecallApiConfigMock.mockReturnValue({
      success: true,
      config: {
        apiKey: 'Token recall-api-key',
        baseUrl: 'https://ap-northeast-1.recall.ai/api/v1',
        botName: 'Twenty Recall Bot',
      },
    });

    await scheduleRecallRecordingBot({
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-01T13:00:00.000Z',
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Token recall-api-key',
        }),
      }),
    );
  });
});
