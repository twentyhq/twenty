import { CustomError } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH_ERROR_CODE } from '@/host/component-source/constants/FrontComponentSourceChecksumMismatchErrorCode';
import { isNewerComponentSourceAvailable } from '@/host/component-source/utils/isNewerComponentSourceAvailable';
import { type CheckForNewerComponentSource } from '@/types/CheckForNewerComponentSource';

const checksumMismatchError = new CustomError(
  'checksum mismatch',
  FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH_ERROR_CODE,
);

describe('isNewerComponentSourceAvailable', () => {
  it.each([true, false])(
    'returns the answer of the host (%s) after a checksum mismatch',
    async (hostAnswer) => {
      const checkForNewerComponentSource = jest.fn(async () => hostAnswer);

      await expect(
        isNewerComponentSourceAvailable({
          error: checksumMismatchError,
          checkForNewerComponentSource,
        }),
      ).resolves.toBe(hostAnswer);
      expect(checkForNewerComponentSource).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ['a plain error', new Error('Failed to fetch: 500 Internal Server Error')],
    [
      'an error with another code',
      new CustomError('worker crashed', 'FRONT_COMPONENT_WORKER_ERROR'),
    ],
    ['a non-error value', 'checksum mismatch'],
  ])('does not ask the host after %s', async (_label, error) => {
    const checkForNewerComponentSource = jest.fn(async () => true);

    await expect(
      isNewerComponentSourceAvailable({ error, checkForNewerComponentSource }),
    ).resolves.toBe(false);
    expect(checkForNewerComponentSource).not.toHaveBeenCalled();
  });

  it('returns false when the host provides no check', async () => {
    await expect(
      isNewerComponentSourceAvailable({ error: checksumMismatchError }),
    ).resolves.toBe(false);
  });

  it.each([
    [
      'rejects',
      jest.fn(async () => {
        throw new Error('network down');
      }),
    ],
    [
      'throws synchronously',
      jest.fn(() => {
        throw new Error('network down');
      }),
    ],
    ['resolves to a non-boolean', jest.fn(async () => undefined)],
  ])('returns false when the host check %s', async (_label, hostCheck) => {
    await expect(
      isNewerComponentSourceAvailable({
        error: checksumMismatchError,
        checkForNewerComponentSource:
          hostCheck as unknown as CheckForNewerComponentSource,
      }),
    ).resolves.toBe(false);
  });
});
