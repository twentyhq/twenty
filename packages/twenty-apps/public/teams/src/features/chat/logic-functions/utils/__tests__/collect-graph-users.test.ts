import { beforeEach, describe, expect, it, vi } from 'vitest';

import { collectGraphUsers } from 'src/features/chat/logic-functions/utils/collect-graph-users';

const { fetchGraphJsonMock } = vi.hoisted(() => ({
  fetchGraphJsonMock: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/fetch-graph-json',
  () => ({ fetchGraphJson: fetchGraphJsonMock }),
);

const buildUser = (index: number) => ({
  id: `aad-${index}`,
  displayName: `User ${index}`,
  mail: `user${index}@twenty.com`,
});

describe('collectGraphUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('follows the @odata.nextLink across pages until it is exhausted', async () => {
    fetchGraphJsonMock
      .mockResolvedValueOnce({
        value: [buildUser(1)],
        '@odata.nextLink': 'https://graph.microsoft.com/v1.0/users?$skiptoken=1',
      })
      .mockResolvedValueOnce({ value: [buildUser(2)] });

    const result = await collectGraphUsers({
      accessToken: 'token',
      url: 'users?$select=id',
    });

    expect(result.isTruncated).toBe(false);
    expect(result.users.map((user) => user.id)).toEqual(['aad-1', 'aad-2']);
    expect(fetchGraphJsonMock.mock.calls[1][0].url).toBe(
      'https://graph.microsoft.com/v1.0/users?$skiptoken=1',
    );
  });

  it('drops users that are not linkable and de-duplicates by Entra id', async () => {
    fetchGraphJsonMock.mockResolvedValueOnce({
      value: [
        buildUser(1),
        { id: 'aad-1', mail: 'dup@twenty.com' },
        { displayName: 'No id' },
        { id: 'aad-2', displayName: 'Room' },
      ],
    });

    const result = await collectGraphUsers({
      accessToken: 'token',
      url: 'users',
    });

    expect(result.users.map((user) => user.id)).toEqual(['aad-1']);
  });

  it('applies the shouldCollectUser predicate', async () => {
    fetchGraphJsonMock.mockResolvedValueOnce({
      value: [buildUser(1), buildUser(2)],
    });

    const result = await collectGraphUsers({
      accessToken: 'token',
      url: 'users',
      shouldCollectUser: (user) => user.id !== 'aad-1',
    });

    expect(result.users.map((user) => user.id)).toEqual(['aad-2']);
  });

  it('stops at the cap and reports truncation when more remain', async () => {
    fetchGraphJsonMock.mockResolvedValueOnce({
      value: Array.from({ length: 5 }, (_, index) => buildUser(index)),
      '@odata.nextLink': 'https://graph.microsoft.com/v1.0/users?$skiptoken=2',
    });

    const result = await collectGraphUsers({
      accessToken: 'token',
      url: 'users',
      maxUsers: 2,
    });

    expect(result.users).toHaveLength(2);
    expect(result.isTruncated).toBe(true);
    expect(fetchGraphJsonMock).toHaveBeenCalledTimes(1);
  });

  it('does not report truncation when exactly the cap is collected and no page follows', async () => {
    fetchGraphJsonMock.mockResolvedValueOnce({
      value: [buildUser(1), buildUser(2)],
    });

    const result = await collectGraphUsers({
      accessToken: 'token',
      url: 'users',
      maxUsers: 2,
    });

    expect(result.users).toHaveLength(2);
    expect(result.isTruncated).toBe(false);
  });

  it('reports truncation when the page budget runs out with a next link left', async () => {
    fetchGraphJsonMock.mockResolvedValue({
      value: [],
      '@odata.nextLink': 'https://graph.microsoft.com/v1.0/users?$skiptoken=n',
    });

    const result = await collectGraphUsers({
      accessToken: 'token',
      url: 'users',
      maxPages: 2,
    });

    expect(result.isTruncated).toBe(true);
    expect(fetchGraphJsonMock).toHaveBeenCalledTimes(2);
  });
});
