import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { GraphQLError } from 'graphql';

import { findManyRecordsWithOptionalCount } from '@/object-record/utils/findManyRecordsWithOptionalCount';

const timeoutError = new CombinedGraphQLErrors({
  errors: [
    new GraphQLError('Read exceeded its deadline', {
      extensions: { code: 'TIMEOUT', subCode: 'QUERY_READ_TIMEOUT' },
    }),
  ],
});

describe('findManyRecordsWithOptionalCount', () => {
  it('keeps a successful exact count', async () => {
    const findWithoutCount = jest.fn();
    await expect(
      findManyRecordsWithOptionalCount({
        findWithCount: async () => ({ records: ['visible'], totalCount: 12 }),
        findWithoutCount,
        allowMissingTotalCountOnTimeout: true,
      }),
    ).resolves.toEqual({ records: ['visible'], totalCount: 12 });
    expect(findWithoutCount).not.toHaveBeenCalled();
  });

  it('retries a count timeout without inventing a count', async () => {
    const findWithoutCount = jest
      .fn()
      .mockResolvedValue({ records: ['visible'] });
    await expect(
      findManyRecordsWithOptionalCount({
        findWithCount: async () => {
          throw timeoutError;
        },
        findWithoutCount,
        allowMissingTotalCountOnTimeout: true,
      }),
    ).resolves.toEqual({ records: ['visible'] });
    expect(findWithoutCount).toHaveBeenCalledTimes(1);
  });

  it('still fails if the page cannot satisfy the deadline', async () => {
    const findWithoutCount = jest.fn().mockRejectedValue(timeoutError);
    await expect(
      findManyRecordsWithOptionalCount({
        findWithCount: async () => {
          throw timeoutError;
        },
        findWithoutCount,
        allowMissingTotalCountOnTimeout: true,
      }),
    ).rejects.toBe(timeoutError);
    expect(findWithoutCount).toHaveBeenCalledTimes(1);
  });

  it.each([
    new Error('Network unavailable'),
    new CombinedGraphQLErrors({
      errors: [
        new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } }),
      ],
    }),
    new CombinedGraphQLErrors({
      errors: [
        ...timeoutError.errors,
        new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } }),
      ],
    }),
  ])('does not retry unrelated or mixed errors', async (error) => {
    const findWithoutCount = jest.fn();
    await expect(
      findManyRecordsWithOptionalCount({
        findWithCount: async () => {
          throw error;
        },
        findWithoutCount,
        allowMissingTotalCountOnTimeout: true,
      }),
    ).rejects.toBe(error);
    expect(findWithoutCount).not.toHaveBeenCalled();
  });

  it('preserves the contract for callers requiring an exact count', async () => {
    const findWithoutCount = jest.fn();
    await expect(
      findManyRecordsWithOptionalCount({
        findWithCount: async () => {
          throw timeoutError;
        },
        findWithoutCount,
        allowMissingTotalCountOnTimeout: false,
      }),
    ).rejects.toBe(timeoutError);
    expect(findWithoutCount).not.toHaveBeenCalled();
  });
});
