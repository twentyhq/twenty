import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { getAgentRun } from '@/sdk/logic-function/agents/get-agent-run';

describe('getAgentRun', () => {
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

  it('reads a run by its id from /metadata', async () => {
    const agentRun = {
      id: 'run-id',
      threadId: 'thread-id',
      status: 'COMPLETED',
      result: { response: 'done' },
      error: null,
    };

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { agentRun } }), { status: 200 }),
    );

    await expect(getAgentRun('run-id')).resolves.toEqual(agentRun);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(requestInit?.body as string);

    expect(url).toBe('https://api.test/metadata');
    expect(sentBody.query).toContain('agentRun(id: $id)');
    expect(sentBody.variables).toEqual({ id: 'run-id' });
  });

  it('surfaces an unknown run as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Agent run run-id not found' }] }),
        { status: 200 },
      ),
    );

    await expect(getAgentRun('run-id')).rejects.toThrow(/not found/);
  });
});
