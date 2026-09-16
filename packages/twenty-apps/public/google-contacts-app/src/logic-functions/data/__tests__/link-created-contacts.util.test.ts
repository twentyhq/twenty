import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { linkCreatedContacts } from 'src/logic-functions/data/link-created-contacts.util';

const buildClient = (mutation: ReturnType<typeof vi.fn>): CoreApiClient =>
  ({ mutation }) as unknown as CoreApiClient;

const CREATED_CONTACTS = [
  { personId: 'p1', resourceName: 'people/1' },
  { personId: 'p2', resourceName: 'people/2' },
];

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('linkCreatedContacts', () => {
  it('should write the google id back on every person in one upsert', async () => {
    const mutation = vi.fn().mockResolvedValue({});

    await linkCreatedContacts({
      client: buildClient(mutation),
      createdContacts: CREATED_CONTACTS,
    });

    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation.mock.calls[0][0].createPeople.__args).toEqual({
      data: [
        { id: 'p1', googleContactsId: '1' },
        { id: 'p2', googleContactsId: '2' },
      ],
      upsert: true,
    });
  });

  it('should fall back to linking one by one when the batch upsert fails', async () => {
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('unique violation'))
      .mockResolvedValue({});

    await linkCreatedContacts({
      client: buildClient(mutation),
      createdContacts: CREATED_CONTACTS,
    });

    expect(mutation).toHaveBeenCalledTimes(3);
    expect(mutation.mock.calls[1][0].updatePerson.__args).toEqual({
      id: 'p1',
      data: { googleContactsId: '1' },
    });
  });

  it('should keep linking the others when one person cannot be linked', async () => {
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('unique violation'))
      .mockRejectedValueOnce(new Error('unique violation'))
      .mockResolvedValue({});

    await linkCreatedContacts({
      client: buildClient(mutation),
      createdContacts: CREATED_CONTACTS,
    });

    expect(mutation).toHaveBeenCalledTimes(3);
    expect(mutation.mock.calls[2][0].updatePerson.__args.id).toBe('p2');
  });

  it('should make no call when nothing was created', async () => {
    const mutation = vi.fn();

    await linkCreatedContacts({
      client: buildClient(mutation),
      createdContacts: [],
    });

    expect(mutation).not.toHaveBeenCalled();
  });
});
