import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

const { matchLinkedinParticipantPersonId } =
  await import('src/logic-functions/utils/match-linkedin-participant-person-id.util');

const JULIE = {
  id: 'ACoJULIE',
  display_name: 'Julie Martin',
  public_identifier: 'juliemartin',
};

const HANDLE = 'https://www.linkedin.com/in/juliemartin';

const buildPeople = (
  people: { id: string; primaryLinkUrl?: string | null }[],
) => ({
  people: {
    edges: people.map(({ id, primaryLinkUrl = null }) => ({
      node: { id, linkedinLink: { primaryLinkUrl } },
    })),
  },
});

describe('matchLinkedinParticipantPersonId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches the person whose LinkedIn link has the same profile slug', async () => {
    mocks.query.mockResolvedValueOnce(
      buildPeople([
        { id: 'other-id', primaryLinkUrl: 'linkedin.com/in/juliemartin-2' },
        {
          id: 'julie-id',
          primaryLinkUrl: 'https://linkedin.com/in/JulieMartin/',
        },
      ]),
    );

    await expect(
      matchLinkedinParticipantPersonId({
        user: JULIE,
        isNameMatchingEnabled: true,
      }),
    ).resolves.toBe('julie-id');
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('links the only unlinked namesake and stores the profile link on it', async () => {
    mocks.query
      .mockResolvedValueOnce(buildPeople([]))
      .mockResolvedValueOnce(
        buildPeople([
          { id: 'namesake-id' },
          { id: 'linked-namesake-id', primaryLinkUrl: 'linkedin.com/in/x' },
        ]),
      );

    await expect(
      matchLinkedinParticipantPersonId({
        user: JULIE,
        isNameMatchingEnabled: true,
      }),
    ).resolves.toBe('namesake-id');
    expect(mocks.mutation).toHaveBeenCalledExactlyOnceWith({
      updatePerson: {
        __args: {
          id: 'namesake-id',
          data: { linkedinLink: { primaryLinkUrl: HANDLE } },
        },
        id: true,
      },
    });
  });

  it('links nobody when several namesakes match', async () => {
    mocks.query
      .mockResolvedValueOnce(buildPeople([]))
      .mockResolvedValueOnce(
        buildPeople([{ id: 'acme-julie-id' }, { id: 'globex-julie-id' }]),
      );

    await expect(
      matchLinkedinParticipantPersonId({
        user: JULIE,
        isNameMatchingEnabled: true,
      }),
    ).resolves.toBeUndefined();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('only matches on the profile link when name matching is off', async () => {
    mocks.query.mockResolvedValueOnce(buildPeople([]));

    await expect(
      matchLinkedinParticipantPersonId({
        user: JULIE,
        isNameMatchingEnabled: false,
      }),
    ).resolves.toBeUndefined();
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });
});
