import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import cancelRecallBotOnCallRecordingDeleteLogicFunction, {
  cancelRecallBotOnCallRecordingDeleteHandler,
} from 'src/logic-functions/cancel-recall-bot-on-call-recording-delete';

type HandlerEvent = Parameters<
  typeof cancelRecallBotOnCallRecordingDeleteHandler
>[0];

const buildDeleteEvent = (
  externalBotId: string | null = 'recall-bot-1',
): HandlerEvent => {
  return {
    name: 'callRecording.deleted',
    recordId: 'call-recording-1',
    properties: {
      before: {
        id: 'call-recording-1',
        externalBotId,
      },
    },
  } as HandlerEvent;
};

const fetchMock = vi.fn();
const RECALL_BOT_URL = 'https://us-west-2.recall.ai/api/v1/bot/recall-bot-1/';

describe('cancelRecallBotOnCallRecordingDeleteHandler', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv(RECALL_API_KEY_ENV_VAR_NAME, 'recall-api-key');
    vi.stubEnv(RECALL_REGION_ENV_VAR_NAME, 'us-west-2');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('subscribes only to CallRecording deletion events', () => {
    expect(
      cancelRecallBotOnCallRecordingDeleteLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({
      eventName: 'callRecording.deleted',
    });
  });

  it('cancels the Recall bot referenced by the deleted CallRecording', async () => {
    const result = await cancelRecallBotOnCallRecordingDeleteHandler(
      buildDeleteEvent(' recall-bot-1 '),
    );

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      RECALL_BOT_URL,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Token recall-api-key',
        }),
      }),
    );
    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      externalBotId: 'recall-bot-1',
      canceled: true,
    });
  });

  it('reports when Recall does not remove the bot', async () => {
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
        return new Response(
          JSON.stringify({ detail: 'cancellation rejected' }),
          {
            status: 400,
          },
        );
      }

      return new Response(JSON.stringify({ detail: 'ejection rejected' }), {
        status: 400,
      });
    });

    const result =
      await cancelRecallBotOnCallRecordingDeleteHandler(buildDeleteEvent());

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${RECALL_BOT_URL}leave_call/`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      externalBotId: 'recall-bot-1',
      canceled: false,
    });
  });

  it.each([null, '   '])(
    'skips deleted CallRecordings without a usable bot id',
    async (externalBotId) => {
      const result = await cancelRecallBotOnCallRecordingDeleteHandler(
        buildDeleteEvent(externalBotId),
      );

      expect(result).toEqual({
        skipped: true,
        reason: 'call recording has no Recall bot',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('ignores unexpected event names', async () => {
    const result = await cancelRecallBotOnCallRecordingDeleteHandler({
      ...buildDeleteEvent(),
      name: 'callRecording.updated',
    });

    expect(result).toEqual({
      skipped: true,
      reason: 'not a call recording deletion',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
