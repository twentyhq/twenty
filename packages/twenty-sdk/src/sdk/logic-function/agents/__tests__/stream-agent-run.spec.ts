import { createClient } from 'graphql-sse';
import { type AgentRunEvent } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { streamAgentRun } from '@/sdk/logic-function/agents/stream-agent-run';

vi.mock('graphql-sse', () => ({ createClient: vi.fn() }));

const RUNNING_EVENT: AgentRunEvent = {
  id: 'reply:running',
  type: 'session.status_running',
};
const MESSAGE_EVENT: AgentRunEvent = {
  id: 'reply:text:0',
  type: 'agent.message',
  content: [{ type: 'text', text: 'Done' }],
};
const IDLE_EVENT: AgentRunEvent = {
  id: 'reply:idle',
  type: 'session.status_idle',
  stopReason: 'end_turn',
};

const toResult = (event: AgentRunEvent | null) => ({
  data: { onAgentRunEvent: { threadId: 'thread-id', event } },
});

const mockClient = (results: unknown[]) => {
  const client = {
    iterate: vi.fn(async function* () {
      yield* results;
    }),
    dispose: vi.fn(),
  };

  vi.mocked(createClient).mockReturnValue(client as never);

  return client;
};

const collect = async (events: AsyncIterable<AgentRunEvent>) => {
  const collected: AgentRunEvent[] = [];

  for await (const event of events) {
    collected.push(event);
  }

  return collected;
};

describe('streamAgentRun', () => {
  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    vi.clearAllMocks();
  });

  it('yields the events until the run goes idle, skipping keepalives', async () => {
    const client = mockClient([
      toResult(null),
      toResult(RUNNING_EVENT),
      toResult(MESSAGE_EVENT),
      toResult(null),
      toResult(IDLE_EVENT),
      toResult(MESSAGE_EVENT),
    ]);

    const events = await collect(
      streamAgentRun({
        agentUniversalIdentifier: 'agent-uid',
        threadKey: 'key',
      }),
    );

    expect(events).toEqual([RUNNING_EVENT, MESSAGE_EVENT, IDLE_EVENT]);
    expect(createClient).toHaveBeenCalledWith({
      url: 'https://api.test/metadata',
      headers: { Authorization: 'Bearer app-token' },
    });
    expect(client.iterate).toHaveBeenCalledWith({
      query: expect.stringContaining('onAgentRunEvent('),
      variables: { agentUniversalIdentifier: 'agent-uid', threadKey: 'key' },
    });
    expect(client.dispose).toHaveBeenCalledTimes(1);
  });

  it('surfaces subscription errors as a regular Error', async () => {
    mockClient([{ errors: [{ message: 'Agent not found' }] }]);

    await expect(
      collect(
        streamAgentRun({ agentUniversalIdentifier: 'a', threadKey: 'k' }),
      ),
    ).rejects.toThrow(/Agent not found/);
  });

  it('does not connect once its signal is aborted', async () => {
    mockClient([toResult(RUNNING_EVENT)]);

    const events = await collect(
      streamAgentRun({
        agentUniversalIdentifier: 'a',
        threadKey: 'k',
        signal: AbortSignal.abort(),
      }),
    );

    expect(events).toEqual([]);
    expect(createClient).not.toHaveBeenCalled();
  });
});
