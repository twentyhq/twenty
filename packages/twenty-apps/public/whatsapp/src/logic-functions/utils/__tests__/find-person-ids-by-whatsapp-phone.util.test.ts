import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
  },
}));

const { findPersonIdsByWhatsappPhone } =
  await import('src/logic-functions/utils/find-person-ids-by-whatsapp-phone.util');

const setPeople = (people: object[]) =>
  mocks.query.mockResolvedValue({
    people: { edges: people.map((node) => ({ node })) },
  });

describe('findPersonIdsByWhatsappPhone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds people by their primary and additional phone numbers', async () => {
    setPeople([
      {
        id: 'primary-id',
        phones: {
          primaryPhoneCallingCode: '+33',
          primaryPhoneNumber: '612345678',
        },
      },
      {
        id: 'additional-id',
        phones: {
          primaryPhoneCallingCode: '+33',
          primaryPhoneNumber: '700000000',
          additionalPhones: [{ callingCode: '+33', number: '612345678' }],
        },
      },
    ]);

    await expect(findPersonIdsByWhatsappPhone('+33612345678')).resolves.toEqual(
      ['primary-id', 'additional-id'],
    );
  });

  it('searches every number the calling code could leave', async () => {
    setPeople([]);

    await findPersonIdsByWhatsappPhone('+33612345678');

    expect(mocks.query.mock.calls[0][0].people.__args.filter.or[0]).toEqual({
      phones: {
        primaryPhoneNumber: {
          in: ['33612345678', '3612345678', '612345678', '12345678'],
        },
      },
    });
  });

  it('ignores a person whose number only ends the same way', async () => {
    setPeople([
      {
        id: 'other-country-id',
        phones: {
          primaryPhoneCallingCode: '+44',
          primaryPhoneNumber: '612345678',
        },
      },
    ]);

    await expect(findPersonIdsByWhatsappPhone('+33612345678')).resolves.toEqual(
      [],
    );
  });
});
