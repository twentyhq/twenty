import { type AiRunEvent } from 'twenty-shared/application';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { listRunEvents } from '@/sdk/logic-function/ai/list-run-events';

const EVENTS: AiRunEvent[] = [
  {
    id: 'run-id:started',
    runId: 'run-id',
    type: 'RUN_STARTED',
    createdAt: '2026-10-31T10:00:00.000Z',
  },
  {
    id: 'run-id:completed',
    runId: 'run-id',
    type: 'RUN_COMPLETED',
    createdAt: '2026-10-31T10:00:05.000Z',
    usage: { inputTokens: 12, outputTokens: 7 },
  },
];

describe('listRunEvents', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { aiRunEvents: EVENTS } }), {
        status: 200,
      }),
    );
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('queries the events of a run after a cursor', async () => {
    const events = await listRunEvents({ runId: 'run-id', after: 'cursor' });

    expect(events).toEqual(EVENTS);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(String(requestInit?.body));

    expect(url).toBe('https://api.test/metadata');
    expect(sentBody.query).toContain('aiRunEvents(');
    expect(sentBody.variables).toEqual({ runId: 'run-id', after: 'cursor' });
  });

  it('queries the events of a conversation by agent and thread key', async () => {
    await listRunEvents({
      agentUniversalIdentifier: 'agent-uid',
      threadKey: 'C123:1700000000.000100',
    });

    const sentBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

    expect(sentBody.variables).toEqual({
      agentUniversalIdentifier: 'agent-uid',
      threadKey: 'C123:1700000000.000100',
    });
  });
});
