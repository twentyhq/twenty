import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
  },
}));

const { hasPersonNamedLikeLinkedinUser } =
  await import('src/logic-functions/utils/has-person-named-like-linkedin-user.util');

describe('hasPersonNamedLikeLinkedinUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockResolvedValue({ people: { edges: [] } });
  });

  it('finds a Person with the first and last name of the user', async () => {
    mocks.query.mockResolvedValue({
      people: { edges: [{ node: { id: 'priya-id' } }] },
    });

    await expect(
      hasPersonNamedLikeLinkedinUser({ display_name: 'Priya Nair' }),
    ).resolves.toBe(true);
    expect(mocks.query.mock.calls[0][0].people.__args.filter).toEqual({
      name: {
        firstName: { ilike: 'Priya' },
        lastName: { ilike: 'Nair' },
      },
    });
  });

  it('finds nobody when no Person has that name', async () => {
    await expect(
      hasPersonNamedLikeLinkedinUser({ display_name: 'Priya Nair' }),
    ).resolves.toBe(false);
  });

  it('cannot rule anyone out for a user without a last name', async () => {
    await expect(
      hasPersonNamedLikeLinkedinUser({ display_name: 'Priya' }),
    ).resolves.toBe(true);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
