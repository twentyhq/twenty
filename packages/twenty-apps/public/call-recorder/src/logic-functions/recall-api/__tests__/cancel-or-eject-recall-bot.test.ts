import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';

const ENV_VAR_NAMES = ['RECALL_API_KEY', 'RECALL_REGION'] as const;
const ORIGINAL_ENV_VALUES = ENV_VAR_NAMES.map(
  (envVarName) => [envVarName, process.env[envVarName]] as const,
);

describe('cancelOrEjectRecallBot', () => {
  const fetchMock = vi.fn();

  const buildJsonResponse = (status: number, body: unknown = {}) => ({
    ok: status < 400,
    status,
    json: async () => body,
  });

  const stubRecallApi = ({
    cancelStatus = 204,
    ejectStatus = 403,
    botStatusCode = 'ready',
  } = {}) => {
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        const method = requestInit?.method ?? 'GET';

        if (method === 'DELETE') {
          return buildJsonResponse(cancelStatus);
        }

        if (method === 'POST' && requestUrl.endsWith('/leave_call/')) {
          return buildJsonResponse(ejectStatus);
        }

        if (method === 'GET') {
          return buildJsonResponse(200, {
            id: 'recall-bot-1',
            status_changes: [{ code: botStatusCode }],
          });
        }

        throw new Error(`Unhandled fetch in test: ${method} ${requestUrl}`);
      },
    );
  };

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.RECALL_API_KEY = 'recall-api-key';
    process.env.RECALL_REGION = 'us-east-1';
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    for (const [envVarName, originalValue] of ORIGINAL_ENV_VALUES) {
      if (originalValue === undefined) {
        delete process.env[envVarName];
      } else {
        process.env[envVarName] = originalValue;
      }
    }
  });

  it('reports success when the cancel is accepted', async () => {
    stubRecallApi({ cancelStatus: 204 });

    expect(await cancelOrEjectRecallBot('recall-bot-1')).toBe(true);
  });

  it('ejects an already-joined bot when the cancel is rejected', async () => {
    stubRecallApi({ cancelStatus: 405, ejectStatus: 200 });

    expect(await cancelOrEjectRecallBot('recall-bot-1')).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/leave_call/'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('treats a finished bot rejecting both commands as a completed removal', async () => {
    stubRecallApi({ cancelStatus: 405, ejectStatus: 400, botStatusCode: 'done' });

    expect(await cancelOrEjectRecallBot('recall-bot-1')).toBe(true);
  });

  it('reports failure when both commands fail and the bot is still live', async () => {
    stubRecallApi({
      cancelStatus: 403,
      ejectStatus: 403,
      botStatusCode: 'in_call_recording',
    });

    expect(await cancelOrEjectRecallBot('recall-bot-1')).toBe(false);
  });
});
