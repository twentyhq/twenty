import { describe, expect, it, vi } from 'vitest';

import { handleSyncBackfill } from './sync-backfill-handler';

const buildEvent = (params: {
  secret?: string;
  body?: Record<string, unknown>;
}) => ({
  headers: {
    ...(params.secret ? { 'x-xopure-sync-secret': params.secret } : {}),
  },
  body: params.body ?? { table: 'products', records: [] },
});

const buildClient = () => ({
  query: vi.fn(async () => ({})),
  mutation: vi.fn(async () => ({})),
});

const secretNotConfiguredResponse = {
  statusCode: 500,
  body: {
    ok: false,
    error: {
      code: 'SYNC_SECRET_NOT_CONFIGURED',
      message: 'Sync secret is not configured. Refusing to process request.',
      retryable: true,
    },
  },
};

describe('handleSyncBackfill auth', () => {
  it('rejects requests when expectedSecret is not configured', async () => {
    const client = buildClient();

    const result = await handleSyncBackfill({
      event: buildEvent({ secret: 'provided-secret' }),
      client,
    });

    expect(result).toEqual(secretNotConfiguredResponse);
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('rejects requests when expectedSecret is whitespace-only', async () => {
    const client = buildClient();

    const result = await handleSyncBackfill({
      event: buildEvent({ secret: 'provided-secret' }),
      expectedSecret: '   ',
      client,
    });

    expect(result).toEqual(secretNotConfiguredResponse);
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('rejects requests with the wrong shared secret', async () => {
    const client = buildClient();

    const result = await handleSyncBackfill({
      event: buildEvent({ secret: 'wrong-secret' }),
      expectedSecret: 'right-secret',
      client,
    });

    expect(result).toEqual({
      statusCode: 401,
      body: {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          retryable: false,
        },
      },
    });
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('accepts requests with the configured shared secret', async () => {
    const client = buildClient();

    const result = await handleSyncBackfill({
      event: buildEvent({
        secret: 'right-secret',
        body: { table: 'products', records: [], dryRun: true },
      }),
      expectedSecret: 'right-secret',
      client,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      body: {
        ok: true,
        dryRun: true,
        table: 'products',
      },
    });
  });
});
