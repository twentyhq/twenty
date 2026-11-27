import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  query: vi.fn(),
  mutation: vi.fn(),
  clientOptions: [] as { fetch?: unknown }[],
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
    constructor(options: { fetch?: unknown }) {
      mocks.clientOptions.push(options);
    }

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
    mocks.clientOptions.length = 0;
    mocks.query.mockReset();
    mocks.mutation.mockReset().mockResolvedValue({ updatePeople: [] });
    mocks.getUnipileUserProfile.mockReset().mockResolvedValue({
      ...PRIYA,
      emails: ['priya@acme.com'],
      phone_numbers: ['+33 6 12 34 56 78'],
      specifics: { experience: [{ job_title: 'VP Sales' }] },
    });
  });

  it('fills only the empty fields', async () => {
    mockPerson({
      jobTitle: 'Chief Revenue Officer',
      emails: { primaryEmail: '' },
      phones: { primaryPhoneNumber: '612345678' },
    });

    await enrich();

    expect(getUpdatedData()).toEqual([
      { emails: { primaryEmail: 'priya@acme.com' } },
    ]);
  });

  it('still sets the phone when the email belongs to someone else', async () => {
    mockPerson({ jobTitle: null, emails: null, phones: null });
    mocks.mutation
      .mockResolvedValueOnce({ updatePeople: [] })
      .mockRejectedValueOnce(new Error('duplicate email'));

    await expect(enrich()).resolves.toBeUndefined();

    expect(getUpdatedData()).toEqual([
      { jobTitle: 'VP Sales' },
      { emails: { primaryEmail: 'priya@acme.com' } },
      { phones: { primaryPhoneNumber: '+33 6 12 34 56 78' } },
    ]);
  });

  it('keeps a value a member types while the profile is looked up', async () => {
    mockPerson({ jobTitle: null, emails: null, phones: null });

    await enrich();

    expect(
      mocks.mutation.mock.calls.map(
        ([mutation]) => mutation.updatePeople.__args.filter.and[1],
      ),
    ).toEqual([
      { or: [{ jobTitle: { is: 'NULL' } }, { jobTitle: { eq: '' } }] },
      {
        or: [
          { emails: { primaryEmail: { is: 'NULL' } } },
          { emails: { primaryEmail: { eq: '' } } },
        ],
      },
      {
        or: [
          { phones: { primaryPhoneNumber: { is: 'NULL' } } },
          { phones: { primaryPhoneNumber: { eq: '' } } },
        ],
      },
    ]);
  });

  it('bounds every Twenty call by the deadline', async () => {
    mockPerson({ jobTitle: null, emails: null, phones: null });

    await enrich();

    expect(mocks.clientOptions).toHaveLength(4);
    expect(
      mocks.clientOptions.every(
        (options) => typeof options.fetch === 'function',
      ),
    ).toBe(true);
  });

  it('skips the lookup when every field is already filled', async () => {
    mockPerson({
      jobTitle: 'VP Sales',
      emails: { primaryEmail: 'priya@acme.com' },
      phones: { primaryPhoneNumber: '612345678' },
    });

    await enrich();

    expect(mocks.getUnipileUserProfile).not.toHaveBeenCalled();
  });

  it('looks each person up only once', async () => {
    mockPerson({ jobTitle: null, emails: null, phones: null });

    await enrich();
    await enrich();

    expect(mocks.getUnipileUserProfile).toHaveBeenCalledTimes(1);
  });

  it('stops looking people up once its share of the daily lookups is used', async () => {
    mocks.kvStore.set(
      'linkedin-profile-lookups:unipile-account-id',
      Array.from({ length: 40 }, () => Date.now()),
    );
    mockPerson({ jobTitle: null, emails: null, phones: null });

    await expect(enrich()).resolves.toBeUndefined();

    expect(mocks.getUnipileUserProfile).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });
});
