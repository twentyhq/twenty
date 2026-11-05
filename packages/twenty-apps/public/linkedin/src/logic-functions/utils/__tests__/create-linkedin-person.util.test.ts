import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mutation: vi.fn(), query: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    mutation = mocks.mutation;
    query = mocks.query;
  },
}));

const { createLinkedinPerson } =
  await import('src/logic-functions/utils/create-linkedin-person.util');

const DAPHNE = {
  firstName: 'Daphné',
  lastName: 'Müller',
  handle: 'https://www.linkedin.com/in/daphne-muller',
};

const getCreatedPersonId = () =>
  mocks.mutation.mock.calls[0][0].createPerson.__args.data.id;

describe('createLinkedinPerson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutation.mockImplementation(async (input) => ({
      createPerson: { id: input.createPerson.__args.data.id },
    }));
  });

  it('gives the same profile the same person id, whatever the link format', async () => {
    await createLinkedinPerson(DAPHNE);
    await createLinkedinPerson({
      ...DAPHNE,
      handle: 'linkedin.com/in/Daphne-Muller/',
    });

    const [firstId, secondId] = mocks.mutation.mock.calls.map(
      ([input]) => input.createPerson.__args.data.id,
    );

    expect(firstId).toBe(secondId);
    expect(firstId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('reuses the person another job created first for the same profile', async () => {
    mocks.mutation.mockRejectedValue(new Error('duplicate key value'));
    mocks.query.mockResolvedValue({
      people: {
        edges: [
          {
            node: {
              id: 'existing-id',
              linkedinLink: { primaryLinkUrl: DAPHNE.handle },
            },
          },
        ],
      },
    });

    await expect(createLinkedinPerson(DAPHNE)).resolves.toBe('existing-id');
  });

  it('creates the person with a new id when its id belongs to a deleted person', async () => {
    mocks.mutation
      .mockRejectedValueOnce(
        new Error(
          'A duplicate entry was detected: unique constraint person.person_pkey was violated',
        ),
      )
      .mockResolvedValueOnce({ createPerson: { id: 'new-id' } });
    mocks.query.mockResolvedValue({ people: { edges: [] } });

    await expect(createLinkedinPerson(DAPHNE)).resolves.toBe('new-id');
    expect(getCreatedPersonId()).toBeDefined();
    expect(
      mocks.mutation.mock.calls[1][0].createPerson.__args.data,
    ).not.toHaveProperty('id');
  });

  it('rethrows when the person cannot be created at all', async () => {
    mocks.mutation.mockRejectedValue(new Error('Forbidden'));
    mocks.query.mockResolvedValue({ people: { edges: [] } });

    await expect(createLinkedinPerson(DAPHNE)).rejects.toThrow('Forbidden');
    expect(mocks.mutation).toHaveBeenCalledOnce();
  });
});
