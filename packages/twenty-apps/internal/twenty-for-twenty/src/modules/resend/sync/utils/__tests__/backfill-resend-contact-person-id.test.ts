import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillResendContactPersonId } from '@modules/resend/sync/utils/backfill-resend-contact-person-id';

type QueryMock = ReturnType<typeof vi.fn>;
type MutationMock = ReturnType<typeof vi.fn>;

const buildClient = (
  query: QueryMock,
  mutation: MutationMock,
): CoreApiClient => ({ query, mutation }) as unknown as CoreApiClient;

describe('backfillResendContactPersonId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns early without querying when no entries are provided', async () => {
    const query = vi.fn();
    const mutation = vi.fn();

    const result = await backfillResendContactPersonId(
      buildClient(query, mutation),
      new Map(),
    );

    expect(result).toEqual({ updated: 0, errors: [] });
    expect(query).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('only updates contacts whose personId is null', async () => {
    const query = vi.fn(async () => ({
      resendContacts: {
        edges: [
          {
            node: {
              id: 'contact-1',
              personId: null,
              email: { primaryEmail: 'foo@example.com' },
            },
          },
          {
            node: {
              id: 'contact-2',
              personId: 'existing-person',
              email: { primaryEmail: 'bar@example.com' },
            },
          },
        ],
      },
    }));
    const mutation = vi.fn(async () => ({}));

    const result = await backfillResendContactPersonId(
      buildClient(query, mutation),
      new Map([
        ['foo@example.com', 'twenty-person-foo'],
        ['bar@example.com', 'twenty-person-bar'],
      ]),
    );

    expect(result.updated).toBe(1);
    expect(result.errors).toEqual([]);
    expect(mutation).toHaveBeenCalledTimes(1);

    const [call] = mutation.mock.calls as unknown as Array<
      [{ updateResendContact: { __args: unknown } }]
    >;

    expect(call?.[0].updateResendContact.__args).toEqual({
      id: 'contact-1',
      data: { personId: 'twenty-person-foo' },
    });
  });

  it('captures mutation errors per record without aborting the batch', async () => {
    const query = vi.fn(async () => ({
      resendContacts: {
        edges: [
          {
            node: {
              id: 'contact-1',
              personId: null,
              email: { primaryEmail: 'foo@example.com' },
            },
          },
          {
            node: {
              id: 'contact-2',
              personId: null,
              email: { primaryEmail: 'bar@example.com' },
            },
          },
        ],
      },
    }));

    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({});

    const result = await backfillResendContactPersonId(
      buildClient(query, mutation),
      new Map([
        ['foo@example.com', 'twenty-person-foo'],
        ['bar@example.com', 'twenty-person-bar'],
      ]),
    );

    expect(result.updated).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('contact-1');
    expect(result.errors[0]).toContain('boom');
  });

  it('captures lookup errors and returns immediately', async () => {
    const query = vi.fn().mockRejectedValue(new Error('lookup failed'));
    const mutation = vi.fn();

    const result = await backfillResendContactPersonId(
      buildClient(query, mutation),
      new Map([['foo@example.com', 'twenty-person-foo']]),
    );

    expect(result.updated).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('lookup failed');
    expect(mutation).not.toHaveBeenCalled();
  });
});
