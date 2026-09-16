import { type AxiosInstance } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchExistingContacts } from 'src/logic-functions/data/fetch-existing-contacts.util';

const buildAxiosInstance = (get: ReturnType<typeof vi.fn>): AxiosInstance =>
  ({ get }) as unknown as AxiosInstance;

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('fetchExistingContacts', () => {
  it('should key contacts by the resource name that was asked for', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        responses: [
          {
            requestedResourceName: 'people/1',
            // Google answers a merged contact under its canonical name
            person: { resourceName: 'people/canonical', etag: 'etag-1' },
          },
        ],
      },
    });

    const contacts = await fetchExistingContacts({
      axiosInstance: buildAxiosInstance(get),
      googleContactsIds: ['1'],
    });

    expect(contacts.get('people/1')?.resourceName).toBe('people/canonical');
  });

  it('should ask for every requested contact by resource name', async () => {
    const get = vi.fn().mockResolvedValue({ data: { responses: [] } });

    await fetchExistingContacts({
      axiosInstance: buildAxiosInstance(get),
      googleContactsIds: ['1', '2'],
    });

    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][0]).toContain('resourceNames=people%2F1');
    expect(get.mock.calls[0][0]).toContain('resourceNames=people%2F2');
  });

  it('should drop a contact Google could not return', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        responses: [
          {
            requestedResourceName: 'people/1',
            status: { code: 5, message: 'Not found' },
          },
        ],
      },
    });

    const contacts = await fetchExistingContacts({
      axiosInstance: buildAxiosInstance(get),
      googleContactsIds: ['1'],
    });

    expect(contacts.size).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No usable Google contact'),
      'people/1',
      'Not found',
    );
  });

  it('should drop a contact returned without an etag', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        responses: [
          {
            requestedResourceName: 'people/1',
            person: { resourceName: 'people/1' },
          },
        ],
      },
    });

    const contacts = await fetchExistingContacts({
      axiosInstance: buildAxiosInstance(get),
      googleContactsIds: ['1'],
    });

    expect(contacts.size).toBe(0);
  });

  it('should make no request when nothing is linked yet', async () => {
    const get = vi.fn();

    const contacts = await fetchExistingContacts({
      axiosInstance: buildAxiosInstance(get),
      googleContactsIds: [],
    });

    expect(contacts.size).toBe(0);
    expect(get).not.toHaveBeenCalled();
  });
});
