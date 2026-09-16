import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { fetchPeopleForSync } from 'src/logic-functions/data/fetch-people-for-sync.util';

const buildClient = (query: ReturnType<typeof vi.fn>): CoreApiClient =>
  ({ query }) as unknown as CoreApiClient;

const readFilter = (query: ReturnType<typeof vi.fn>, call: number) =>
  query.mock.calls[call][0].people.__args.filter;

describe('fetchPeopleForSync', () => {
  it('should key linked people by their google id', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        people: {
          edges: [
            { node: { id: 'p1', googleContactsId: 'c1', updatedAt: 'now' } },
          ],
        },
      })
      .mockResolvedValue({ people: { edges: [] } });

    const { byGoogleContactsId } = await fetchPeopleForSync({
      client: buildClient(query),
      googleContactsIds: ['c1'],
      primaryEmails: [],
    });

    expect(byGoogleContactsId.get('c1')?.id).toBe('p1');
    expect(readFilter(query, 0)).toEqual({ googleContactsId: { in: ['c1'] } });
  });

  it('should key people by their lowercased primary email', async () => {
    const query = vi.fn().mockResolvedValue({
      people: {
        edges: [
          { node: { id: 'p1', emails: { primaryEmail: 'John@Example.com' } } },
        ],
      },
    });

    const { byPrimaryEmail } = await fetchPeopleForSync({
      client: buildClient(query),
      googleContactsIds: [],
      primaryEmails: ['John@Example.com'],
    });

    expect(byPrimaryEmail.get('john@example.com')?.id).toBe('p1');
  });

  it('should ask for both the given and the lowercased spelling', async () => {
    const query = vi.fn().mockResolvedValue({ people: { edges: [] } });

    await fetchPeopleForSync({
      client: buildClient(query),
      googleContactsIds: [],
      primaryEmails: ['John@Example.com'],
    });

    expect(readFilter(query, 0)).toEqual({
      emails: {
        primaryEmail: { in: ['John@Example.com', 'john@example.com'] },
      },
    });
  });

  it('should make no query when there is nothing to look up', async () => {
    const query = vi.fn();

    const { byGoogleContactsId, byPrimaryEmail } = await fetchPeopleForSync({
      client: buildClient(query),
      googleContactsIds: [],
      primaryEmails: [],
    });

    expect(byGoogleContactsId.size).toBe(0);
    expect(byPrimaryEmail.size).toBe(0);
    expect(query).not.toHaveBeenCalled();
  });
});
