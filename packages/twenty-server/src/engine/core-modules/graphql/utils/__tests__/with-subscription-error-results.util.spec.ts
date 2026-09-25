import { type ExecutionResult, GraphQLError } from 'graphql';

import { withSubscriptionErrorResults } from 'src/engine/core-modules/graphql/utils/with-subscription-error-results.util';

describe('withSubscriptionErrorResults', () => {
  it('closes a failing source once and emits only one terminal error', async () => {
    const failure = new GraphQLError('Access denied');
    const source = {
      next: jest.fn().mockRejectedValue(failure),
      return: jest.fn().mockResolvedValue({ done: true, value: undefined }),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
    const iterator = withSubscriptionErrorResults(source);

    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: { errors: [failure] },
    });
    await expect(iterator.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    await iterator.return?.();

    expect(source.next).toHaveBeenCalledTimes(1);
    expect(source.return).toHaveBeenCalledTimes(1);
  });

  it('forwards cancellation while next is pending and discards the pending value', async () => {
    let finishNext!: (result: IteratorResult<ExecutionResult>) => void;
    const source = {
      next: jest.fn(
        () =>
          new Promise<IteratorResult<ExecutionResult>>((resolve) => {
            finishNext = resolve;
          }),
      ),
      return: jest.fn(async () => {
        finishNext({ done: false, value: { data: { message: 'too late' } } });

        return { done: true as const, value: undefined };
      }),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
    const iterator = withSubscriptionErrorResults(source);
    const pending = iterator.next();

    await iterator.return?.();

    await expect(pending).resolves.toEqual({ done: true, value: undefined });
    await expect(iterator.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(source.return).toHaveBeenCalledTimes(1);
  });

  it('preserves the source error when cleanup also fails', async () => {
    const failure = new GraphQLError('Access denied');
    const source: AsyncIterableIterator<ExecutionResult> = {
      next: async () => {
        throw failure;
      },
      return: async () => {
        throw new Error('Cleanup failed');
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
    const iterator = withSubscriptionErrorResults(source);

    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: { errors: [failure] },
    });
    await expect(iterator.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
  });
});
