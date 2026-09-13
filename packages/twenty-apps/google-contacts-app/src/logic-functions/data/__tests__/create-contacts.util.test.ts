import { type AxiosInstance } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createContacts } from 'src/logic-functions/data/create-contacts.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import { type ContactToCreate } from 'src/logic-functions/types/contact-write.type';

const buildContactToCreate = (personId: string): ContactToCreate =>
  ({
    person: { id: personId },
    contact: {
      names: [{ givenName: personId }],
      emailAddresses: [{ value: `${personId}@example.com` }],
    },
  }) as ContactToCreate;

const buildCreatedPerson = (personId: string, resourceName: string) => ({
  person: {
    resourceName,
    names: [{ givenName: personId }],
    emailAddresses: [{ value: `${personId}@example.com` }],
  },
});

const buildAxiosInstance = (post: ReturnType<typeof vi.fn>): AxiosInstance =>
  ({ post }) as unknown as AxiosInstance;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('createContacts', () => {
  it('should return the resource name Google created for each contact', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        createdPeople: [
          buildCreatedPerson('p1', 'people/1'),
          buildCreatedPerson('p2', 'people/2'),
        ],
      },
    });

    await expect(
      createContacts({
        axiosInstance: buildAxiosInstance(post),
        contactsToCreate: [
          buildContactToCreate('p1'),
          buildContactToCreate('p2'),
        ],
      }),
    ).resolves.toEqual([
      { personId: 'p1', resourceName: 'people/1' },
      { personId: 'p2', resourceName: 'people/2' },
    ]);
  });

  it('should pair contacts by content when Google answers out of order', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        createdPeople: [
          buildCreatedPerson('p2', 'people/2'),
          buildCreatedPerson('p1', 'people/1'),
        ],
      },
    });

    await expect(
      createContacts({
        axiosInstance: buildAxiosInstance(post),
        contactsToCreate: [
          buildContactToCreate('p1'),
          buildContactToCreate('p2'),
        ],
      }),
    ).resolves.toEqual([
      { personId: 'p1', resourceName: 'people/1' },
      { personId: 'p2', resourceName: 'people/2' },
    ]);
  });

  it('should skip a contact Google reported an error for', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        createdPeople: [
          { status: { code: 3, message: 'Invalid' } },
          buildCreatedPerson('p2', 'people/2'),
        ],
      },
    });

    await expect(
      createContacts({
        axiosInstance: buildAxiosInstance(post),
        contactsToCreate: [
          buildContactToCreate('p1'),
          buildContactToCreate('p2'),
        ],
      }),
    ).resolves.toEqual([{ personId: 'p2', resourceName: 'people/2' }]);
  });

  it('should not create anything when the batch request fails', async () => {
    const post = vi.fn().mockRejectedValue(new Error('boom'));

    await expect(
      createContacts({
        axiosInstance: buildAxiosInstance(post),
        contactsToCreate: [buildContactToCreate('p1')],
      }),
    ).resolves.toEqual([]);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('should let an auth failure stop the whole export', async () => {
    const post = vi.fn().mockRejectedValue(new GoogleAuthFailedError(401));

    await expect(
      createContacts({
        axiosInstance: buildAxiosInstance(post),
        contactsToCreate: [buildContactToCreate('p1')],
      }),
    ).rejects.toBeInstanceOf(GoogleAuthFailedError);
  });
});
