import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { isDefined } from 'twenty-shared/utils';

import { useGetChatThreadsQuery } from '~/generated-metadata/graphql';

const CHAT_THREADS_PAGE_SIZE = 20;
const FETCH_MORE_ROOT_MARGIN = '200px';

export const useChatThreads = () => {
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const { data, loading, fetchMore } = useGetChatThreadsQuery({
    variables: {
      input: { first: CHAT_THREADS_PAGE_SIZE },
    },
    onCompleted: () => {
      setShouldFetchMore(false);
    },
  });

  const threads = data?.chatThreads.threads ?? [];
  const pageInfo = data?.chatThreads.pageInfo;
  const endCursor = pageInfo?.endCursor ?? undefined;
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  const { ref: fetchMoreRef, inView } = useInView({
    rootMargin: FETCH_MORE_ROOT_MARGIN,
  });

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading || !endCursor) {
      return;
    }

    return fetchMore({
      variables: {
        input: {
          first: CHAT_THREADS_PAGE_SIZE,
          after: endCursor,
        },
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.chatThreads?.threads?.length) {
          return previousResult;
        }

        return {
          chatThreads: {
            ...fetchMoreResult.chatThreads,
            threads: [
              ...previousResult.chatThreads.threads,
              ...fetchMoreResult.chatThreads.threads,
            ],
          },
        };
      },
    });
  }, [hasNextPage, loading, endCursor, fetchMore]);

  useEffect(() => {
    if (inView && hasNextPage && !loading && !shouldFetchMore) {
      setShouldFetchMore(true);
      const promise = loadMore();
      if (isDefined(promise)) {
        promise.finally(() => setShouldFetchMore(false));
      } else {
        setShouldFetchMore(false);
      }
    }
  }, [inView, hasNextPage, loading, shouldFetchMore, loadMore]);

  return {
    threads,
    hasNextPage,
    loading,
    fetchMoreRef,
  };
};
