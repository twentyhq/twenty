import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  query: vi.fn(),
  mutation: vi.fn(),
  getUnipileUserProfile: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock('src/unipile/utils/get-unipile-user-profile.util', () => ({
  getUnipileUserProfile: mocks.getUnipileUserProfile,
}));

const { buildLinkedinProfileHandle } =
  await import('src/logic-functions/utils/build-linkedin-profile-handle.util');

const { enrichLinkedinPersons } =
  await import('src/logic-functions/utils/enrich-linkedin-persons.util');

const PRIYA = {
  id: 'priya-provider-id',
  display_name: 'Priya Shah',
  public_identifier: 'priya-shah',
};

const PRIYA_HANDLE = buildLinkedinProfileHandle(PRIYA);

const enrich = () =>
  enrichLinkedinPersons({
    unipileAccountId: 'unipile-account-id',
    counterparts: [PRIYA],
    personIdByHandle: new Map([[PRIYA_HANDLE, 'priya-id']]),
    deadlineAtMs: Date.now() + 60_000,
  });

const mockPerson = (person: Record<string, unknown>) =>
  mocks.query.mockResolvedValue({
    people: { edges: [{ node: { id: 'priya-id', ...person } }] },
  });

const getUpdatedData = () =>
  mocks.mutation.mock.calls.map(
    ([mutation]) => mutation.updatePeople.__args.data,
  );

describe('enrichLinkedinPersons', () => {
  beforeEach(() => {
    mocks.kvStore.clear();
    mocks.query.mockReset();
    mocks.mutation.mockReset().mockResolvedValue({ updatePeople: [] });
    mocks.getUnipileUserProfile.mockReset().mockResolvedValue({
      ...PRIYA,
      location: 'Paris, France',
      emails: ['priya@acme.com'],
      specifics: { experience: [{ job_title: 'VP Sales' }] },
    });
  });

  it('fills only the empty fields, the email on its own', async () => {
    mockPerson({
      jobTitle: 'Chief Revenue Officer',
      city: '',
      emails: { primaryEmail: '' },
      xLink: { primaryLinkUrl: '' },
    });

    await enrich();

    expect(getUpdatedData()).toEqual([
      { city: 'Paris' },
      { emails: { primaryEmail: 'priya@acme.com' } },
    ]);
  });

  it('keeps the other fields when the email belongs to someone else', async () => {
    mockPerson({ jobTitle: null, city: null, emails: null, xLink: null });
    mocks.mutation
      .mockResolvedValueOnce({ updatePeople: [] })
      .mockRejectedValueOnce(new Error('duplicate email'));

    await expect(enrich()).resolves.toBeUndefined();

    expect(getUpdatedData()[0]).toEqual({
      jobTitle: 'VP Sales',
      city: 'Paris',
    });
  });

  it('looks each person up only once', async () => {
    mockPerson({ jobTitle: null, city: null, emails: null, xLink: null });

    await enrich();
    await enrich();

    expect(mocks.getUnipileUserProfile).toHaveBeenCalledTimes(1);
  });

  it('stops looking people up once its share of the daily lookups is used', async () => {
    mocks.kvStore.set(
      'linkedin-profile-lookups:unipile-account-id',
      Array.from({ length: 40 }, () => Date.now()),
    );
    mockPerson({ jobTitle: null, city: null, emails: null, xLink: null });

    await expect(enrich()).resolves.toBeUndefined();

    expect(mocks.getUnipileUserProfile).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });
});
