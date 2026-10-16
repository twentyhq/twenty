import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { listAgentRunEvents } from '@/sdk/logic-function/agents/list-agent-run-events';

describe('listAgentRunEvents', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('queries the events of the conversation and returns them', async () => {
    const payload = {
      threadId: 'thread-id',
      events: [
        {
          id: 'message-id:text:0',
          type: 'user.message',
          content: [{ type: 'text', text: 'Hello' }],
        },
        {
          id: 'reply-id:idle',
          type: 'session.status_idle',
          stopReason: 'end_turn',
        },
      ],
    };

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { agentRunEvents: payload } }), {
        status: 200,
      }),
    );

    const result = await listAgentRunEvents({
      agentUniversalIdentifier: 'agent-uid',
      threadKey: 'C123:1700000000.000100',
    });

    expect(result).toEqual(payload);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(requestInit?.body as string);

    expect(url).toBe('https://api.test/metadata');
    expect(sentBody.query).toContain('agentRunEvents(');
    expect(sentBody.variables).toEqual({
      agentUniversalIdentifier: 'agent-uid',
      threadKey: 'C123:1700000000.000100',
    });
  });
});
