import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  query: vi.fn(),
  mutation: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
    delete: async (key: string) => mocks.kvStore.delete(key),
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

const { linkedinResolvePersonReviewHandler } =
  await import('src/logic-functions/linkedin-resolve-person-review');

const HANDLE = 'https://www.linkedin.com/in/juliemartin';
const REVIEWS_KEY = 'linkedin-person-reviews:connection-id';

const resolveReview = (body: Record<string, unknown>) =>
  linkedinResolvePersonReviewHandler({ body } as never, {
    userWorkspaceId: 'member-user-workspace-id',
  });

describe('linkedinResolvePersonReviewHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.listConnections.mockResolvedValue([
      {
        id: 'connection-id',
        name: 'Ada Lovelace',
        handle: 'https://www.linkedin.com/in/ada',
        userWorkspaceId: 'member-user-workspace-id',
        authFailedAt: null,
      },
    ]);
    mocks.kvStore.set(REVIEWS_KEY, {
      [HANDLE]: {
        handle: HANDLE,
        displayName: 'Julie Martin',
        firstName: 'Julie',
        lastName: 'Martin',
        candidatePersonIds: ['acme-julie-id', 'globex-julie-id'],
        lastMessageAt: '2026-10-20T10:00:00.000Z',
      },
    });
    mocks.query.mockResolvedValue({ people: { edges: [] } });
    mocks.mutation.mockResolvedValue({ createPerson: { id: 'created-id' } });
  });

  it('links the picked person and clears the review', async () => {
    await expect(
      resolveReview({ handle: HANDLE, personId: 'globex-julie-id' }),
    ).resolves.toEqual(expect.objectContaining({ personReviews: [] }));

    expect(mocks.mutation).toHaveBeenCalledExactlyOnceWith({
      updatePerson: {
        __args: {
          id: 'globex-julie-id',
          data: { linkedinLink: { primaryLinkUrl: HANDLE } },
        },
        id: true,
      },
    });
    expect(mocks.kvStore.has(REVIEWS_KEY)).toBe(false);
  });

  it('creates a new person when none is picked', async () => {
    await resolveReview({ handle: HANDLE });

    expect(mocks.mutation).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        createPerson: expect.objectContaining({
          __args: {
            data: {
              name: { firstName: 'Julie', lastName: 'Martin' },
              linkedinLink: { primaryLinkUrl: HANDLE },
            },
          },
        }),
      }),
    );
  });

  it('refuses a person that was not suggested', async () => {
    await expect(
      resolveReview({ handle: HANDLE, personId: 'someone-else-id' }),
    ).rejects.toThrow('Pick one of the suggested people.');
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(mocks.kvStore.has(REVIEWS_KEY)).toBe(true);
  });
});
