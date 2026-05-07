import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { enqueueLogicFunctionExecution } from '@/sdk/logic-function/enqueue-logic-function-execution';

describe('enqueueLogicFunctionExecution', () => {
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

  it('POSTs to /app/logic-functions/enqueue with universalIdentifier', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ jobId: 'job-1', status: 'queued' }), {
        status: 202,
      }),
    );

    const result = await enqueueLogicFunctionExecution({
      universalIdentifier: '550e8400-e29b-41d4-a716-446655440000',
      payload: { foo: 'bar' },
    });

    expect(result).toEqual({ jobId: 'job-1', status: 'queued' });
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.test/app/logic-functions/enqueue',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          universalIdentifier: '550e8400-e29b-41d4-a716-446655440000',
          payload: { foo: 'bar' },
        }),
        headers: expect.objectContaining({
          Authorization: 'Bearer app-token',
        }),
      }),
    );
  });

  it('POSTs with name when provided', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ jobId: 'job-2', status: 'queued' }), {
        status: 202,
      }),
    );

    await enqueueLogicFunctionExecution({
      name: 'my-fn',
      payload: {},
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ name: 'my-fn', payload: {} }),
      }),
    );
  });

  it('throws when env vars are missing', async () => {
    delete process.env.TWENTY_API_URL;

    await expect(
      enqueueLogicFunctionExecution({
        name: 'x',
        payload: {},
      }),
    ).rejects.toThrow(/TWENTY_API_URL/);
  });

  it('throws when neither name nor universalIdentifier is provided', async () => {
    await expect(
      enqueueLogicFunctionExecution({ payload: {} }),
    ).rejects.toThrow(/exactly one of name or universalIdentifier/);
  });

  it('throws when both name and universalIdentifier are provided', async () => {
    await expect(
      enqueueLogicFunctionExecution({
        name: 'a',
        universalIdentifier: '550e8400-e29b-41d4-a716-446655440000',
        payload: {},
      }),
    ).rejects.toThrow(/exactly one of name or universalIdentifier/);
  });
});
