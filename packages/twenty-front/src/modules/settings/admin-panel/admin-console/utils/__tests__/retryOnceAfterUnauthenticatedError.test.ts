import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { retryOnceAfterUnauthenticatedError } from '@/settings/admin-panel/admin-console/utils/retryOnceAfterUnauthenticatedError';

const buildGraphQLError = (code: string) =>
  new CombinedGraphQLErrors({
    errors: [{ message: 'Refused', extensions: { code } }],
  });

describe('retryOnceAfterUnauthenticatedError', () => {
  it('retries once when the first attempt is refused as unauthenticated', async () => {
    const attempt = jest
      .fn()
      .mockRejectedValueOnce(buildGraphQLError('UNAUTHENTICATED'))
      .mockResolvedValueOnce('signed in');

    await expect(retryOnceAfterUnauthenticatedError(attempt)).resolves.toBe(
      'signed in',
    );
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it('does not retry a second time', async () => {
    const attempt = jest
      .fn()
      .mockRejectedValue(buildGraphQLError('UNAUTHENTICATED'));

    await expect(retryOnceAfterUnauthenticatedError(attempt)).rejects.toThrow(
      'Refused',
    );
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it('does not retry other errors', async () => {
    const attempt = jest.fn().mockRejectedValue(buildGraphQLError('FORBIDDEN'));

    await expect(retryOnceAfterUnauthenticatedError(attempt)).rejects.toThrow(
      'Refused',
    );
    expect(attempt).toHaveBeenCalledTimes(1);
  });
});
