import { subscriptionRegistryState } from '@/subscription/states/subscriptionRegistryState';
import { type DocumentNode, print } from 'graphql';
import { useEffect, useId } from 'react';
import { useSetRecoilState } from 'recoil';

type UseSubscribeToRefetchParams = {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  refetch: () => void;
  skip?: boolean;
};

export const useSubscribeToRefetch = ({
  query,
  variables,
  refetch,
  skip = false,
}: UseSubscribeToRefetchParams) => {
  const setRegistry = useSetRecoilState(subscriptionRegistryState);
  const subscriptionId = useId();

  const queryString = JSON.stringify({
    query: print(query),
    variables,
  });

  useEffect(() => {
    if (skip) {
      return;
    }

    setRegistry((prev) => {
      const next = new Map(prev);
      next.set(subscriptionId, {
        id: subscriptionId,
        query: queryString,
        onRefetch: refetch,
      });
      return next;
    });

    return () => {
      setRegistry((prev) => {
        const next = new Map(prev);
        next.delete(subscriptionId);
        return next;
      });
    };
  }, [subscriptionId, queryString, refetch, skip, setRegistry]);
};
