import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { ai } from '@/sdk/logic-function/ai/ai';

const RESULT = {
  success: true,
  text: 'Acme is a good fit.',
  object: null,
  error: null,
  runId: 'run-id',
  usage: { inputTokens: 12, outputTokens: 7 },
};

describe('ai.generate', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { generate: RESULT } }), {
        status: 200,
      }),
    );
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('POSTs the generate mutation to /metadata and returns the result', async () => {
    const result = await ai.generate({
      input: 'Is Acme a good fit?',
      instructions: 'Qualify leads for Twenty.',
    });

    expect(result).toEqual(RESULT);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('generate(input: $input)');
    expect(sentBody.variables).toEqual({
      input: {
        input: [{ role: 'user', content: 'Is Acme a good fit?' }],
        instructions: 'Qualify leads for Twenty.',
      },
    });
  });

  it('acts as the person who triggered the run rather than the application', async () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';

    try {
      await ai.generate({ input: 'Is Acme a good fit?' });

      expect(
        new Headers(fetchSpy.mock.calls[0][1]?.headers).get('Authorization'),
      ).toBe('Bearer app-token');
    } finally {
      delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    }
  });

  it('sends messages and the scope as given', async () => {
    const scope = {
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
      ],
    };

    await ai.generate({
      input: [
        { role: 'user', content: 'Summarize Acme.' },
        { role: 'assistant', content: 'Which period?' },
        { role: 'user', content: 'This quarter.' },
      ],
      scope,
    });

    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

    expect(sentBody.variables.input.input).toHaveLength(3);
    expect(sentBody.variables.input.scope).toEqual(scope);
  });
});
