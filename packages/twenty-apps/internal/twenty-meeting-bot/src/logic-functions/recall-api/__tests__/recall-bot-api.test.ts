import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { rescheduleRecallBot } from 'src/logic-functions/recall-api/reschedule-recall-bot.util';
import { scheduleRecallBot } from 'src/logic-functions/recall-api/schedule-recall-bot.util';

const getRecallApiConfigMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/recall-api/get-recall-api-config.util', () => ({
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
        botName: 'Twenty Meeting Bot',
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
    const result = await scheduleRecallBot({
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
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      join_at: '2026-01-01T13:00:00.000Z',
      bot_name: 'Twenty Meeting Bot',
      automatic_leave: {
        waiting_room_timeout: 1200,
        noone_joined_timeout: 1200,
      },
      recording_config: {
        video_mixed_mp4: {},
        audio_mixed_mp3: {},
      },
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });
  });

  it('carries the automatic leave config when rescheduling a bot', async () => {
    const result = await rescheduleRecallBot({
      externalBotId: 'recall-bot-id',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-02T13:00:00.000Z',
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(result).toEqual({ ok: true, externalBotId: 'recall-bot-id' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/bot/recall-bot-id/',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(
      expect.objectContaining({
        automatic_leave: {
          waiting_room_timeout: 1200,
          noone_joined_timeout: 1200,
        },
      }),
    );
  });

  it('cancels a scheduled Recall bot request', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    const result = await cancelRecallBot({
      externalBotId: 'recall-bot-id',
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/bot/recall-bot-id/',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('fails when the create response does not include a bot id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({}),
    });

    const result = await scheduleRecallBot({
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

    const result = await rescheduleRecallBot({
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
        botName: 'Twenty Meeting Bot',
      },
    });

    await scheduleRecallBot({
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

  describe('transient failure retries', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('retries a network failure and succeeds on the next attempt', async () => {
      fetchMock.mockRejectedValueOnce(new Error('socket hang up'));
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'recall-bot-id' }),
      });

      const resultPromise = rescheduleRecallBot({
        externalBotId: 'recall-bot-id',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        joinAt: '2026-01-01T13:00:00.000Z',
        metadata: {
          twentyCallRecordingId: 'call-recording-id',
          twentyCalendarEventId: 'calendar-event-id',
          twentyRealMeetingKey: 'meeting-key',
        },
      });

      await vi.runAllTimersAsync();

      expect(await resultPromise).toEqual({
        ok: true,
        externalBotId: 'recall-bot-id',
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('gives up after the attempt budget on persistent server errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'server error' }),
      });

      const resultPromise = rescheduleRecallBot({
        externalBotId: 'recall-bot-id',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        joinAt: '2026-01-01T13:00:00.000Z',
        metadata: {
          twentyCallRecordingId: 'call-recording-id',
          twentyCalendarEventId: 'calendar-event-id',
          twentyRealMeetingKey: 'meeting-key',
        },
      });

      await vi.runAllTimersAsync();

      expect(await resultPromise).toEqual({
        ok: false,
        status: 500,
        errorMessage:
          'Recall API responded with HTTP 500: {"detail":"server error"}',
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('does not retry an allowed 404 on cancel', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'not found' }),
      });

      const result = await cancelRecallBot({
        externalBotId: 'recall-bot-id',
      });

      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
