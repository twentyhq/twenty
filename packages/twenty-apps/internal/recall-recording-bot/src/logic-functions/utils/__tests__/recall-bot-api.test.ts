import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAsyncRecallTranscript,
  ejectRecallRecordingBot,
  getRecallBot,
  listScheduledRecallBots,
  rescheduleRecallRecordingBot,
  retrieveRecallTranscript,
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
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      join_at: '2026-01-01T13:00:00.000Z',
      bot_name: 'Twenty Recall Bot',
      automatic_leave: {
        waiting_room_timeout: 600,
        noone_joined_timeout: 600,
      },
      metadata: {
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });
  });

  it('carries the automatic leave config when rescheduling a bot', async () => {
    const result = await rescheduleRecallRecordingBot({
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
          waiting_room_timeout: 600,
          noone_joined_timeout: 600,
        },
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

  it('lists scheduled bots in a join-at window and follows pagination', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: 'https://ap-northeast-1.recall.ai/api/v1/bot/?cursor=page-2',
          results: [
            { id: 'bot-1', metadata: { twentyCallRecordingId: 'recording-1' } },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: null,
          results: [{ id: 'bot-2' }],
        }),
      });

    const result = await listScheduledRecallBots({
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      joinAtBefore: '2026-01-02T12:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      bots: [
        { id: 'bot-1', metadata: { twentyCallRecordingId: 'recording-1' } },
        { id: 'bot-2', metadata: {} },
      ],
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://ap-northeast-1.recall.ai/api/v1/bot/?join_at_after=2026-01-01T08%3A00%3A00.000Z&join_at_before=2026-01-02T12%3A00%3A00.000Z',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://ap-northeast-1.recall.ai/api/v1/bot/?cursor=page-2',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('stops paginating when the next link points outside the configured region', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        next: 'https://evil.example.com/api/v1/bot/?cursor=page-2',
        results: [{ id: 'bot-1' }],
      }),
    });

    const result = await listScheduledRecallBots({
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      joinAtBefore: '2026-01-02T12:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      bots: [{ id: 'bot-1', metadata: {} }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('ejects a bot through the leave_call endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'recall-bot-id' }),
    });

    const result = await ejectRecallRecordingBot({
      externalBotId: 'recall-bot-id',
    });

    expect(result).toEqual({ ok: true, externalBotId: null });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/bot/recall-bot-id/leave_call/',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fetches a single bot and returns the raw response', async () => {
    const botResponse = {
      id: 'recall-bot-id',
      status_changes: [{ code: 'done' }],
      recordings: [{ id: 'recall-recording-id' }],
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => botResponse,
    });

    const result = await getRecallBot({ externalBotId: 'recall-bot-id' });

    expect(result).toEqual({ ok: true, bot: botResponse });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/bot/recall-bot-id/',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('reports the HTTP status when fetching a bot that no longer exists', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not found.' }),
    });

    const result = await getRecallBot({ externalBotId: 'recall-bot-gone' });

    expect(result).toEqual({
      ok: false,
      status: 404,
      errorMessage:
        'Recall API responded with HTTP 404: {"detail":"Not found."}',
    });
  });

  it('creates an async transcript with the locked provider settings', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'recall-transcript-id' }),
    });

    const result = await createAsyncRecallTranscript({
      externalRecordingId: 'recall-recording-id',
    });

    expect(result).toEqual({ ok: true, transcriptId: 'recall-transcript-id' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/recording/recall-recording-id/create_transcript/',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      provider: { recallai_async: { language_code: 'auto' } },
      diarization: { use_separate_streams_when_available: true },
    });
  });

  it('fails when the transcript creation response has no id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({}),
    });

    const result = await createAsyncRecallTranscript({
      externalRecordingId: 'recall-recording-id',
    });

    expect(result).toEqual({
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a transcript but the response did not include a transcript id',
    });
  });

  it('retrieves transcript details with the download URL and status', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'recall-transcript-id',
        status: { code: 'done', sub_code: null },
        data: {
          download_url: 'https://recall-transcripts.example.com/transcript',
        },
      }),
    });

    const result = await retrieveRecallTranscript({
      transcriptId: 'recall-transcript-id',
    });

    expect(result).toEqual({
      ok: true,
      transcript: {
        downloadUrl: 'https://recall-transcripts.example.com/transcript',
        statusCode: 'done',
        statusSubCode: null,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/transcript/recall-transcript-id/',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('surfaces the failure sub code of an errored transcript', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'recall-transcript-id',
        status: { code: 'error', sub_code: 'audio_missing' },
        data: {},
      }),
    });

    const result = await retrieveRecallTranscript({
      transcriptId: 'recall-transcript-id',
    });

    expect(result).toEqual({
      ok: true,
      transcript: {
        downloadUrl: null,
        statusCode: 'error',
        statusSubCode: 'audio_missing',
      },
    });
  });
});
