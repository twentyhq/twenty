import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
  },
}));

const { findPersonIdsByLinkedinHandle } =
  await import('src/logic-functions/utils/find-person-ids-by-linkedin-handle.util');

const mockStoredLinks = (links: string[]) =>
  mocks.query.mockResolvedValue({
    people: {
      edges: links.map((primaryLinkUrl, index) => ({
        node: { id: `person-${index}`, linkedinLink: { primaryLinkUrl } },
      })),
    },
  });

describe('findPersonIdsByLinkedinHandle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    'https://www.linkedin.com/in/daphn%C3%A9-m%C3%BCller',
    'linkedin.com/in/Daphné-Müller/',
    'https://www.linkedin.com/in/daphné-müller',
  ])('finds a person stored as %s', async (storedLink) => {
    mockStoredLinks([storedLink]);

    await expect(
      findPersonIdsByLinkedinHandle(
        'https://www.linkedin.com/in/daphné-müller',
      ),
    ).resolves.toEqual(['person-0']);
  });

  it('searches the decoded, decomposed and encoded forms of an accented slug', async () => {
    mockStoredLinks([]);

    await findPersonIdsByLinkedinHandle(
      'https://www.linkedin.com/in/daphn%C3%A9-m%C3%BCller',
    );

    const patterns = mocks.query.mock.calls[0][0].people.__args.filter.or.map(
      (condition: { linkedinLink: { primaryLinkUrl: { ilike: string } } }) =>
        condition.linkedinLink.primaryLinkUrl.ilike,
    );

    expect(patterns).toEqual([
      '%linkedin.com/in/daphné-müller%',
      '%linkedin.com/in/daphné-müller%',
      '%linkedin.com/in/daphn\\%C3\\%A9-m\\%C3\\%BCller%',
      '%linkedin.com/in/daphne\\%CC\\%81-mu\\%CC\\%88ller%',
    ]);
  });

  it('ignores people whose link only contains the slug', async () => {
    mockStoredLinks(['https://www.linkedin.com/in/daphné-müller-2']);

    await expect(
      findPersonIdsByLinkedinHandle(
        'https://www.linkedin.com/in/daphné-müller',
      ),
    ).resolves.toEqual([]);
  });
});
