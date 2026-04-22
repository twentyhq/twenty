import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { backfillResendEmailsFromContacts } from '@modules/resend/sync/utils/backfill-resend-emails-from-contacts';

type QueryMock = ReturnType<typeof vi.fn>;
type MutationMock = ReturnType<typeof vi.fn>;

const buildClient = (
  query: QueryMock,
  mutation: MutationMock,
): CoreApiClient => ({ query, mutation }) as unknown as CoreApiClient;

describe('backfillResendEmailsFromContacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns early without querying when no entries are provided', async () => {
    const query = vi.fn();
    const mutation = vi.fn();

    const result = await backfillResendEmailsFromContacts(
      buildClient(query, mutation),
      new Map(),
    );

    expect(result).toEqual({ updated: 0, errors: [] });
    expect(query).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('only fills the FK fields that are currently null and skips records where both are already set', async () => {
    const query = vi.fn(async () => ({
      resendEmails: {
        edges: [
          {
            node: {
              id: 'email-1',
              contactId: null,
              personId: null,
              toAddresses: { primaryEmail: 'foo@example.com' },
            },
          },
          {
            node: {
              id: 'email-2',
              contactId: 'existing-contact',
              personId: 'existing-person',
              toAddresses: { primaryEmail: 'foo@example.com' },
            },
          },
          {
            node: {
              id: 'email-3',
              contactId: null,
              personId: 'existing-person',
              toAddresses: { primaryEmail: 'bar@example.com' },
            },
          },
          {
            node: {
              id: 'email-4',
              contactId: 'existing-contact',
              personId: null,
              toAddresses: { primaryEmail: 'foo@example.com' },
            },
          },
        ],
      },
    }));
    const mutation = vi.fn(async () => ({}));

    const result = await backfillResendEmailsFromContacts(
      buildClient(query, mutation),
      new Map([
        [
          'foo@example.com',
          { contactId: 'twenty-contact-foo', personId: 'twenty-person-foo' },
        ],
        ['bar@example.com', { contactId: 'twenty-contact-bar' }],
      ]),
    );

    expect(result.updated).toBe(3);
    expect(result.errors).toEqual([]);
    expect(mutation).toHaveBeenCalledTimes(3);

    const callArgs = (
      mutation.mock.calls as unknown as Array<
        [{ updateResendEmail: { __args: unknown } }]
      >
    ).map((call) => call[0].updateResendEmail.__args);

    expect(callArgs).toEqual([
      {
        id: 'email-1',
        data: {
          contactId: 'twenty-contact-foo',
          personId: 'twenty-person-foo',
        },
      },
      {
        id: 'email-3',
        data: { contactId: 'twenty-contact-bar' },
      },
      {
        id: 'email-4',
        data: { personId: 'twenty-person-foo' },
      },
    ]);
  });

  it('captures mutation errors per record without aborting the batch', async () => {
    const query = vi.fn(async () => ({
      resendEmails: {
        edges: [
          {
            node: {
              id: 'email-1',
              contactId: null,
              personId: null,
              toAddresses: { primaryEmail: 'foo@example.com' },
            },
          },
          {
            node: {
              id: 'email-2',
              contactId: null,
              personId: null,
              toAddresses: { primaryEmail: 'foo@example.com' },
            },
          },
        ],
      },
    }));

    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({});

    const result = await backfillResendEmailsFromContacts(
      buildClient(query, mutation),
      new Map([['foo@example.com', { contactId: 'twenty-contact-foo' }]]),
    );

    expect(result.updated).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('email-1');
    expect(result.errors[0]).toContain('boom');
  });

  it('paginates the resendEmails lookup until pageInfo.hasNextPage is false', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        resendEmails: {
          edges: [
            {
              node: {
                id: 'email-page-1',
                contactId: null,
                personId: null,
                toAddresses: { primaryEmail: 'foo@example.com' },
              },
            },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      })
      .mockResolvedValueOnce({
        resendEmails: {
          edges: [
            {
              node: {
                id: 'email-page-2',
                contactId: null,
                personId: null,
                toAddresses: { primaryEmail: 'foo@example.com' },
              },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      });
    const mutation = vi.fn(async () => ({}));

    const result = await backfillResendEmailsFromContacts(
      buildClient(query, mutation),
      new Map([['foo@example.com', { contactId: 'twenty-contact-foo' }]]),
    );

    expect(query).toHaveBeenCalledTimes(2);
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(result.updated).toBe(2);
    expect(result.errors).toEqual([]);

    const secondCallArgs = (
      query.mock.calls[1] as unknown as Array<{
        resendEmails: { __args: { after?: string } };
      }>
    )[0].resendEmails.__args;

    expect(secondCallArgs.after).toBe('cursor-1');
  });

  it('also rewrites toAddresses with normalized primaryEmail / additionalEmails when the stored values are mixed case', async () => {
    const query = vi.fn(async () => ({
      resendEmails: {
        edges: [
          {
            node: {
              id: 'email-mixed',
              contactId: null,
              personId: null,
              toAddresses: {
                primaryEmail: 'Foo@Example.com',
                additionalEmails: ['Bar@EXAMPLE.com', 'baz@example.com'],
              },
            },
          },
          {
            node: {
              id: 'email-already-normalized',
              contactId: null,
              personId: null,
              toAddresses: {
                primaryEmail: 'foo@example.com',
                additionalEmails: null,
              },
            },
          },
        ],
      },
    }));
    const mutation = vi.fn(async () => ({}));

    const result = await backfillResendEmailsFromContacts(
      buildClient(query, mutation),
      new Map([['foo@example.com', { contactId: 'twenty-contact-foo' }]]),
    );

    expect(result.updated).toBe(2);
    expect(result.errors).toEqual([]);

    const callArgs = (
      mutation.mock.calls as unknown as Array<
        [{ updateResendEmail: { __args: unknown } }]
      >
    ).map((call) => call[0].updateResendEmail.__args);

    expect(callArgs).toEqual([
      {
        id: 'email-mixed',
        data: {
          contactId: 'twenty-contact-foo',
          toAddresses: {
            primaryEmail: 'foo@example.com',
            additionalEmails: ['bar@example.com', 'baz@example.com'],
          },
        },
      },
      {
        id: 'email-already-normalized',
        data: {
          contactId: 'twenty-contact-foo',
        },
      },
    ]);
  });

  it('captures lookup errors and returns immediately', async () => {
    const query = vi.fn().mockRejectedValue(new Error('lookup failed'));
    const mutation = vi.fn();

    const result = await backfillResendEmailsFromContacts(
      buildClient(query, mutation),
      new Map([['foo@example.com', { contactId: 'twenty-contact-foo' }]]),
    );

    expect(result.updated).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('lookup failed');
    expect(mutation).not.toHaveBeenCalled();
  });
});
