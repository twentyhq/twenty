import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/recall-api/create-async-recall-transcript.util';
import { ejectRecallBot } from 'src/logic-functions/recall-api/eject-recall-bot.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { listRecallTranscripts } from 'src/logic-functions/recall-api/list-recall-transcripts.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { rescheduleRecallBot } from 'src/logic-functions/recall-api/reschedule-recall-bot.util';
import { retrieveRecallTranscript } from 'src/logic-functions/recall-api/retrieve-recall-transcript.util';
import { scheduleRecallBot } from 'src/logic-functions/recall-api/schedule-recall-bot.util';
import { MEETING_BOT_RECORDING_RETENTION_HOURS_ENV_VAR_NAME } from 'src/logic-functions/constants/meeting-bot-recording-retention-hours-env-var-name';

const getRecallApiConfigMock = vi.hoisted(() => vi.fn());
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

vi.mock('src/logic-functions/recall-api/get-recall-api-config.util', () => ({
  getRecallApiConfig: getRecallApiConfigMock,
}));

describe('recall bot api', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    delete process.env[MEETING_BOT_RECORDING_RETENTION_HOURS_ENV_VAR_NAME];
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
        twentyWorkspaceId: WORKSPACE_ID,
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
      recording_config: {
        video_mixed_mp4: {},
        audio_mixed_mp3: {},
        retention: { type: 'timed', hours: 166 },
      },
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });
  });

  it('uses the configured Recall recording retention hours when scheduling a bot', async () => {
    process.env[MEETING_BOT_RECORDING_RETENTION_HOURS_ENV_VAR_NAME] = '240';

    const result = await scheduleRecallBot({
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-01T13:00:00.000Z',
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(result).toEqual({ ok: true, externalBotId: 'recall-bot-id' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).recording_config).toEqual(
      {
        video_mixed_mp4: {},
        audio_mixed_mp3: {},
        retention: { type: 'timed', hours: 240 },
      },
    );
  });

  it('falls back to safe Recall recording retention hours when the configured value is invalid', async () => {
    process.env[MEETING_BOT_RECORDING_RETENTION_HOURS_ENV_VAR_NAME] =
      'seven-days';

    const result = await scheduleRecallBot({
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      joinAt: '2026-01-01T13:00:00.000Z',
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-id',
        twentyCalendarEventId: 'calendar-event-id',
        twentyRealMeetingKey: 'meeting-key',
      },
    });

    expect(result).toEqual({ ok: true, externalBotId: 'recall-bot-id' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).recording_config).toEqual(
      {
        video_mixed_mp4: {},
        audio_mixed_mp3: {},
        retention: { type: 'timed', hours: 166 },
      },
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
        twentyWorkspaceId: WORKSPACE_ID,
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
        twentyWorkspaceId: WORKSPACE_ID,
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
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).recording_config).toEqual(
      {
        video_mixed_mp4: {},
        audio_mixed_mp3: {},
        retention: { type: 'timed', hours: 166 },
      },
    );
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
        twentyWorkspaceId: WORKSPACE_ID,
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

  it('fails the scheduled bot list when the pagination cap would truncate results', async () => {
    for (let pageIndex = 1; pageIndex <= 10; pageIndex++) {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: `https://ap-northeast-1.recall.ai/api/v1/bot/?cursor=page-${pageIndex + 1}`,
          results: [{ id: `bot-${pageIndex}` }],
        }),
      });
    }

    const result = await listScheduledRecallBots({
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      joinAtBefore: '2026-01-02T12:00:00.000Z',
    });

    expect(result).toEqual({
      ok: false,
      status: null,
      errorMessage: 'Recall bot list exceeded 10 pages',
    });
    expect(fetchMock).toHaveBeenCalledTimes(10);
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

  it('ejects a bot through the leave_call endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'recall-bot-id' }),
    });

    const result = await ejectRecallBot({
      externalBotId: 'recall-bot-id',
    });

    expect(result).toEqual({ ok: true });
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

  it('lists transcripts for a recording id and normalizes status fields', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        next: null,
        results: [
          {
            id: 'recall-transcript-id',
            status: { code: 'done', sub_code: null },
          },
        ],
      }),
    });

    const result = await listRecallTranscripts({
      externalRecordingId: 'recall-recording-id',
    });

    expect(result).toEqual({
      ok: true,
      transcripts: [
        {
          id: 'recall-transcript-id',
          statusCode: 'done',
          statusSubCode: undefined,
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://ap-northeast-1.recall.ai/api/v1/transcript/?recording_id=recall-recording-id',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('follows transcript list pagination within the configured Recall region', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: 'https://ap-northeast-1.recall.ai/api/v1/transcript/?cursor=page-2',
          results: [
            {
              id: 'recall-transcript-id-1',
              status: { code: 'processing' },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: null,
          results: [
            {
              id: 'recall-transcript-id-2',
              status: { code: 'failed', sub_code: 'audio_missing' },
            },
          ],
        }),
      });

    const result = await listRecallTranscripts({
      externalRecordingId: 'recall-recording-id',
    });

    expect(result).toEqual({
      ok: true,
      transcripts: [
        {
          id: 'recall-transcript-id-1',
          statusCode: 'processing',
          statusSubCode: undefined,
        },
        {
          id: 'recall-transcript-id-2',
          statusCode: 'failed',
          statusSubCode: 'audio_missing',
        },
      ],
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://ap-northeast-1.recall.ai/api/v1/transcript/?cursor=page-2',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('rejects malformed transcript lists', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        next: null,
        results: [{}],
      }),
    });

    const result = await listRecallTranscripts({
      externalRecordingId: 'recall-recording-id',
    });

    expect(result).toEqual({
      ok: false,
      status: 200,
      errorMessage: 'Recall API returned malformed transcript list',
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

  it('adds call recording metadata when convergence creates an async transcript', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'recall-transcript-id' }),
    });

    const result = await createAsyncRecallTranscript({
      externalRecordingId: 'recall-recording-id',
      callRecordingId: 'call-recording-id',
    });

    expect(result).toEqual({ ok: true, transcriptId: 'recall-transcript-id' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      provider: { recallai_async: { language_code: 'auto' } },
      diarization: { use_separate_streams_when_available: true },
      metadata: { twentyCallRecordingId: 'call-recording-id' },
    });
  });

  it('does not retry async transcript creation failures', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'service unavailable' }),
    });

    const result = await createAsyncRecallTranscript({
      externalRecordingId: 'recall-recording-id',
    });

    expect(result).toEqual({
      ok: false,
      status: 503,
      errorMessage:
        'Recall API responded with HTTP 503: {"detail":"service unavailable"}',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
        statusSubCode: undefined,
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
        downloadUrl: undefined,
        statusCode: 'error',
        statusSubCode: 'audio_missing',
      },
    });
  });

  it('rejects malformed transcript details', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'recall-transcript-id',
          status: { code: 'done' },
          data: {},
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'recall-transcript-id',
          data: {},
        }),
      });

    await expect(
      retrieveRecallTranscript({ transcriptId: 'recall-transcript-id' }),
    ).resolves.toEqual({
      ok: false,
      status: 200,
      errorMessage: 'Recall API returned malformed transcript details',
    });
    await expect(
      retrieveRecallTranscript({ transcriptId: 'recall-transcript-id' }),
    ).resolves.toEqual({
      ok: false,
      status: 200,
      errorMessage: 'Recall API returned malformed transcript details',
    });
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

      const resultPromise = getRecallBot({ externalBotId: 'recall-bot-id' });

      await vi.runAllTimersAsync();

      expect(await resultPromise).toEqual({
        ok: true,
        bot: { id: 'recall-bot-id' },
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('retries a 503 response and succeeds on the next attempt', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ detail: 'service unavailable' }),
      });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'recall-bot-id' }),
      });

      const resultPromise = getRecallBot({ externalBotId: 'recall-bot-id' });

      await vi.runAllTimersAsync();

      expect(await resultPromise).toEqual({
        ok: true,
        bot: { id: 'recall-bot-id' },
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('gives up after the attempt budget on persistent server errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'server error' }),
      });

      const resultPromise = getRecallBot({ externalBotId: 'recall-bot-id' });

      await vi.runAllTimersAsync();

      expect(await resultPromise).toEqual({
        ok: false,
        status: 500,
        errorMessage:
          'Recall API responded with HTTP 500: {"detail":"server error"}',
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('does not retry client errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'bad request' }),
      });

      const result = await getRecallBot({ externalBotId: 'recall-bot-id' });

      expect(result).toEqual({
        ok: false,
        status: 400,
        errorMessage:
          'Recall API responded with HTTP 400: {"detail":"bad request"}',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
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

    it('does not retry an allowed 404 on eject', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'not found' }),
      });

      const result = await ejectRecallBot({
        externalBotId: 'recall-bot-id',
      });

      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
