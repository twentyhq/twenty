import { CombinedGraphQLErrors } from '@apollo/client/errors';

export const findManyRecordsWithOptionalCount = async <TResult>({
  findWithCount,
  findWithoutCount,
  allowMissingTotalCountOnTimeout,
}: {
  findWithCount: () => Promise<TResult>;
  findWithoutCount: () => Promise<TResult>;
  allowMissingTotalCountOnTimeout: boolean;
}): Promise<TResult> => {
  try {
    return await findWithCount();
  } catch (error) {
    if (
      !allowMissingTotalCountOnTimeout ||
      !CombinedGraphQLErrors.is(error) ||
      error.errors.length === 0 ||
      !error.errors.every(
        (graphQLError) =>
          graphQLError.extensions?.subCode === 'QUERY_READ_TIMEOUT',
      )
    ) {
      throw error;
    }

    // The page must still satisfy the same filter and permission deadline.
    return findWithoutCount();
  }
};
