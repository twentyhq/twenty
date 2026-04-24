import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findResendContactsByEmail } from '@modules/resend/shared/utils/find-resend-contacts-by-email';

describe('findResendContactsByEmail', () => {
  const buildClient = (
    queryImpl: ReturnType<typeof vi.fn>,
  ): CoreApiClient => ({ query: queryImpl }) as unknown as CoreApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty map without querying when no emails are provided', async () => {
    const query = vi.fn();

    const result = await findResendContactsByEmail(buildClient(query), []);

    expect(result.size).toBe(0);
    expect(query).not.toHaveBeenCalled();
  });

  it('returns an empty map without querying when only nullish/empty emails are provided', async () => {
    const query = vi.fn();

    const result = await findResendContactsByEmail(buildClient(query), [
      null,
      undefined,
      '',
    ]);

    expect(result.size).toBe(0);
    expect(query).not.toHaveBeenCalled();
  });

  it('queries with deduplicated normalized emails and indexes results by normalized primaryEmail', async () => {
    const query = vi.fn(async () => ({
      resendContacts: {
        edges: [
          {
            node: {
              id: 'contact-1',
              personId: 'person-1',
              email: { primaryEmail: 'Foo@Example.com' },
            },
          },
          {
            node: {
              id: 'contact-2',
              personId: null,
              email: { primaryEmail: 'bar@example.com' },
            },
          },
          {
            node: {
              id: 'contact-3',
              personId: null,
              email: { primaryEmail: null },
            },
          },
        ],
      },
    }));

    const result = await findResendContactsByEmail(buildClient(query), [
      ' Foo@Example.com ',
      'foo@example.com',
      'bar@example.com',
    ]);

    expect(query).toHaveBeenCalledTimes(1);

    const args = query.mock.calls[0][0];

    expect(args.resendContacts.__args.filter.email.primaryEmail.in).toEqual([
      'foo@example.com',
      'bar@example.com',
    ]);

    expect(result.get('foo@example.com')).toEqual({
      id: 'contact-1',
      personId: 'person-1',
    });
    expect(result.get('bar@example.com')).toEqual({
      id: 'contact-2',
      personId: null,
    });
    expect(result.size).toBe(2);
  });
});
