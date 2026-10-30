import { describe, expect, it } from 'vitest';

import {
  UnipileRequestError,
  withUnipileErrorContext,
} from 'src/unipile/utils/with-unipile-error-context.util';

describe('withUnipileErrorContext', () => {
  it('turns the Unipile JSON error body into an error naming the request', async () => {
    const promise = withUnipileErrorContext('list inbox chats', () =>
      Promise.reject({
        status: 400,
        title: 'Invalid querystring',
        detail: 'limit must be <= 50',
      }),
    );

    await expect(promise).rejects.toThrow(
      'Unipile list inbox chats failed (400): Invalid querystring: limit must be <= 50',
    );
    await expect(promise).rejects.toBeInstanceOf(UnipileRequestError);
    await expect(promise).rejects.toMatchObject({ status: 400 });
  });

  it('rethrows network errors unchanged', async () => {
    const networkError = new TypeError('fetch failed');

    await expect(
      withUnipileErrorContext('list inboxes', () =>
        Promise.reject(networkError),
      ),
    ).rejects.toBe(networkError);
  });
});
