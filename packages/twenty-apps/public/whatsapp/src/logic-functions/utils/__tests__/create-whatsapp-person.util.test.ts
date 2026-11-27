import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mutation: vi.fn(), query: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    mutation = mocks.mutation;
    query = mocks.query;
  },
}));

const { createWhatsappPerson } =
  await import('src/logic-functions/utils/create-whatsapp-person.util');

const DAPHNE = {
  firstName: 'Daphné',
  lastName: 'Müller',
  handle: '+33612345678',
};

const getCreatedPersonId = () =>
  mocks.mutation.mock.calls[0][0].createPerson.__args.data.id;

describe('createWhatsappPerson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutation.mockImplementation(async (input) => ({
      createPerson: { id: input.createPerson.__args.data.id },
    }));
  });

  it('creates the person with their phone number, under an id two jobs would both pick', async () => {
    await createWhatsappPerson(DAPHNE);
    await createWhatsappPerson({ ...DAPHNE, firstName: 'Daphne' });

    const [firstData, secondData] = mocks.mutation.mock.calls.map(
      ([input]) => input.createPerson.__args.data,
    );

    expect(firstData).toMatchObject({
      name: { firstName: 'Daphné', lastName: 'Müller' },
      phones: { primaryPhoneNumber: '+33612345678' },
    });
    expect(firstData.id).toBe(secondData.id);
    expect(firstData.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('reuses the person another job created first for the same number', async () => {
    mocks.mutation.mockRejectedValue(new Error('duplicate key value'));
    mocks.query.mockResolvedValue({
      people: {
        edges: [
          {
            node: {
              id: 'existing-id',
              phones: {
                primaryPhoneCallingCode: '+33',
                primaryPhoneNumber: '612345678',
              },
            },
          },
        ],
      },
    });

    await expect(createWhatsappPerson(DAPHNE)).resolves.toBe('existing-id');
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

    await expect(createWhatsappPerson(DAPHNE)).resolves.toBe('new-id');
    expect(getCreatedPersonId()).toBeDefined();
    expect(
      mocks.mutation.mock.calls[1][0].createPerson.__args.data,
    ).not.toHaveProperty('id');
  });

  it('rethrows when the person cannot be created at all', async () => {
    mocks.mutation.mockRejectedValue(new Error('Forbidden'));
    mocks.query.mockResolvedValue({ people: { edges: [] } });

    await expect(createWhatsappPerson(DAPHNE)).rejects.toThrow('Forbidden');
    expect(mocks.mutation).toHaveBeenCalledOnce();
  });
});
