import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { runAgent } from '@/sdk/logic-function/agents/run-agent';

describe('runAgent', () => {
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

  it('POSTs the runAgent mutation to /metadata and returns the result', async () => {
    const payload = {
      result: { response: 'done' },
      error: null,
      success: true,
    };

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { runAgent: payload } }), {
        status: 200,
      }),
    );

    const result = await runAgent({
      agentUniversalIdentifier: 'agent-uid',
      prompt: 'Enrich record 123',
    });

    expect(result).toEqual(payload);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(requestInit).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer app-token',
        }),
      }),
    );

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('runAgent(input: $input)');
    expect(sentBody.variables).toEqual({
      input: {
        agentUniversalIdentifier: 'agent-uid',
        prompt: 'Enrich record 123',
      },
    });
  });

  it('surfaces GraphQL errors as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Agent not found' }] }),
        { status: 200 },
      ),
    );

    await expect(
      runAgent({ agentUniversalIdentifier: 'a', prompt: 'p' }),
    ).rejects.toThrow(/Agent not found/);
  });

  it('surfaces non-2xx HTTP responses as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response('boom', { status: 500, statusText: 'Server Error' }),
    );

    await expect(
      runAgent({ agentUniversalIdentifier: 'a', prompt: 'p' }),
    ).rejects.toThrow(/HTTP 500/);
  });

  it('throws when the runtime env vars are missing', async () => {
    delete process.env.TWENTY_API_URL;

    await expect(
      runAgent({ agentUniversalIdentifier: 'a', prompt: 'p' }),
    ).rejects.toThrow(/requires the app runtime env vars/);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
