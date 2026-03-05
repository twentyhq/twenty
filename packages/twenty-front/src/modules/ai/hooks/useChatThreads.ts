import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { isDefined } from 'twenty-shared/utils';

import { CHAT_THREADS_PAGE_SIZE } from '@/ai/constants/ChatThreads';

import { useGetChatThreadsQuery } from '~/generated-metadata/graphql';

const FETCH_MORE_ROOT_MARGIN = '200px';

export const useChatThreads = () => {
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const { data, loading, fetchMore } = useGetChatThreadsQuery({
    variables: {
      paging: { first: CHAT_THREADS_PAGE_SIZE },
    },
    onCompleted: () => {
      setShouldFetchMore(false);
    },
  });

  const edges = data?.chatThreads?.edges ?? [];
  const threads = edges.map((edge) => edge.node);
  const pageInfo = data?.chatThreads?.pageInfo;
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
        paging: {
          first: CHAT_THREADS_PAGE_SIZE,
          after: endCursor,
        },
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const newEdges = fetchMoreResult?.chatThreads?.edges ?? [];
        if (newEdges.length === 0) {
          return previousResult;
        }

        return {
          chatThreads: {
            ...fetchMoreResult.chatThreads,
            edges: [...(previousResult.chatThreads?.edges ?? []), ...newEdges],
            pageInfo:
              fetchMoreResult.chatThreads?.pageInfo ??
              previousResult.chatThreads?.pageInfo,
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
