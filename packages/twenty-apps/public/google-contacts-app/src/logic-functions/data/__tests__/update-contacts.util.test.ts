import { type AxiosInstance } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import { updateContacts } from 'src/logic-functions/data/update-contacts.util';
import { type ContactToUpdate } from 'src/logic-functions/types/contact-write.type';

const buildContactToUpdate = (
  personId: string,
  resourceName: string,
  contact: Record<string, unknown> = { names: [{ givenName: personId }] },
): ContactToUpdate =>
  ({
    person: { id: personId },
    contact,
    existingContact: { resourceName, etag: `etag-${personId}` },
  }) as ContactToUpdate;

const buildAxiosInstance = (post: ReturnType<typeof vi.fn>): AxiosInstance =>
  ({ post }) as unknown as AxiosInstance;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('updateContacts', () => {
  it('should send the etag Google last returned for each contact', async () => {
    const post = vi.fn().mockResolvedValue({ data: { updateResult: {} } });

    await updateContacts({
      axiosInstance: buildAxiosInstance(post),
      contactsToUpdate: [buildContactToUpdate('p1', 'people/1')],
    });

    expect(post).toHaveBeenCalledWith('/people:batchUpdateContacts', {
      contacts: {
        'people/1': { names: [{ givenName: 'p1' }], etag: 'etag-p1' },
      },
      updateMask: 'names,emailAddresses,phoneNumbers,organizations,urls',
      readMask: 'names,emailAddresses',
    });
  });

  it('should mask every owned field so the emptied ones are cleared', async () => {
    const post = vi.fn().mockResolvedValue({ data: { updateResult: {} } });

    await updateContacts({
      axiosInstance: buildAxiosInstance(post),
      contactsToUpdate: [
        buildContactToUpdate('p1', 'people/1', { names: [] }),
        buildContactToUpdate('p2', 'people/2', { urls: [] }),
      ],
    });

    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][1].updateMask).toBe(
      'names,emailAddresses,phoneNumbers,organizations,urls',
    );
  });

  it('should hold back a person sharing a merged contact with another', async () => {
    const post = vi.fn().mockResolvedValue({ data: { updateResult: {} } });

    await updateContacts({
      axiosInstance: buildAxiosInstance(post),
      contactsToUpdate: [
        buildContactToUpdate('p1', 'people/1'),
        buildContactToUpdate('p2', 'people/1'),
      ],
    });

    expect(post).toHaveBeenCalledTimes(1);
    expect(Object.keys(post.mock.calls[0][1].contacts)).toEqual(['people/1']);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('sharing a Google contact'),
      'p2',
      'people/1',
    );
  });

  it('should report a contact Google refused', async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        updateResult: {
          'people/1': { status: { code: 9, message: 'Stale etag' } },
        },
      },
    });

    await updateContacts({
      axiosInstance: buildAxiosInstance(post),
      contactsToUpdate: [buildContactToUpdate('p1', 'people/1')],
    });

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to update a contact'),
      'people/1',
      'Stale etag',
    );
  });

  it('should let an auth failure stop the whole export', async () => {
    const post = vi.fn().mockRejectedValue(new GoogleAuthFailedError(403));

    await expect(
      updateContacts({
        axiosInstance: buildAxiosInstance(post),
        contactsToUpdate: [buildContactToUpdate('p1', 'people/1')],
      }),
    ).rejects.toBeInstanceOf(GoogleAuthFailedError);
  });
});
