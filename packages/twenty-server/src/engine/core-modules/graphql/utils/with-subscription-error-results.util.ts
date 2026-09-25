import { type ExecutionResult, GraphQLError, locatedError } from 'graphql';

export const withSubscriptionErrorResults = (
  source: AsyncIterable<ExecutionResult>,
): AsyncIterableIterator<ExecutionResult> => {
  const iterator = source[Symbol.asyncIterator]();
  let isDone = false;
  let closePromise: Promise<IteratorResult<ExecutionResult>> | undefined;

  const close = () => {
    isDone = true;
    closePromise ??= Promise.resolve().then(
      () => iterator.return?.() ?? { done: true, value: undefined },
    );

    return closePromise;
  };

  return {
    async next() {
      if (isDone) {
        return { done: true, value: undefined };
      }

      try {
        const result = await iterator.next();

        if (isDone) {
          return { done: true, value: undefined };
        }

        isDone = result.done === true;

        return result;
      } catch (error) {
        if (isDone) {
          return { done: true, value: undefined };
        }

        // A cleanup failure must not replace the error that ended the stream.
        await close().catch(() => {});

        return {
          done: false,
          value: {
            errors: [
              error instanceof GraphQLError
                ? error
                : locatedError(error, undefined),
            ],
          },
        };
      }
    },
    return: close,
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};
