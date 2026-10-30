import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LINKEDIN_SETTINGS } from 'src/constants/default-linkedin-settings.constant';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  kvDelete: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet, set: mocks.kvSet, delete: mocks.kvDelete },
}));

const { resolveLinkedinParticipantPersonId } =
  await import('src/logic-functions/utils/resolve-linkedin-participant-person-id.util');

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

const resolve = (
  overrides: Partial<
    Parameters<typeof resolveLinkedinParticipantPersonId>[0]
  > = {},
) =>
  resolveLinkedinParticipantPersonId({
    connectedAccountId: 'connection-id',
    user: JULIE,
    settings: DEFAULT_LINKEDIN_SETTINGS,
    hasUserSentMessage: true,
    lastMessageAt: '2026-10-20T10:00:00.000Z',
    ...overrides,
  });

describe('resolveLinkedinParticipantPersonId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvGet.mockResolvedValue(null);
    mocks.mutation.mockResolvedValue({ createPerson: { id: 'created-id' } });
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

    await expect(resolve()).resolves.toBe('julie-id');
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

    await expect(resolve()).resolves.toBe('namesake-id');
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

  it('records a review instead of linking or creating when several namesakes match', async () => {
    mocks.query
      .mockResolvedValueOnce(buildPeople([]))
      .mockResolvedValueOnce(
        buildPeople([{ id: 'acme-julie-id' }, { id: 'globex-julie-id' }]),
      );

    await expect(resolve()).resolves.toBeUndefined();
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(mocks.kvSet).toHaveBeenCalledExactlyOnceWith(
      'linkedin-person-reviews:connection-id',
      {
        [HANDLE]: {
          handle: HANDLE,
          displayName: 'Julie Martin',
          firstName: 'Julie',
          lastName: 'Martin',
          candidatePersonIds: ['acme-julie-id', 'globex-julie-id'],
          lastMessageAt: '2026-10-20T10:00:00.000Z',
        },
      },
    );
  });

  it('creates a person when nobody matches and the policy allows it', async () => {
    mocks.query.mockResolvedValue(buildPeople([]));

    await expect(resolve()).resolves.toBe('created-id');
  });

  it('skips name matching when it is turned off', async () => {
    mocks.query.mockResolvedValue(buildPeople([{ id: 'namesake-id' }]));
    mocks.query.mockResolvedValueOnce(buildPeople([]));

    await expect(
      resolve({
        settings: {
          ...DEFAULT_LINKEDIN_SETTINGS,
          isNameMatchingEnabled: false,
        },
      }),
    ).resolves.toBe('created-id');
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });

  it.each([
    { policy: 'SENT' as const, hasUserSentMessage: false },
    { policy: 'NONE' as const, hasUserSentMessage: true },
  ])(
    'creates nobody with the $policy policy when the member sent: $hasUserSentMessage',
    async ({ policy, hasUserSentMessage }) => {
      mocks.query.mockResolvedValue(buildPeople([]));

      await expect(
        resolve({
          hasUserSentMessage,
          settings: {
            ...DEFAULT_LINKEDIN_SETTINGS,
            contactAutoCreationPolicy: policy,
          },
        }),
      ).resolves.toBeUndefined();
      expect(mocks.mutation).not.toHaveBeenCalled();
    },
  );
});
