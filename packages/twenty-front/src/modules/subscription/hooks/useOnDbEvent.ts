import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { ON_DB_EVENT } from '@/subscription/graphql/subscriptions/onDbEvent';
import { createClient } from 'graphql-sse';
import { useEffect, useMemo } from 'react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { Subscription, SubscriptionOnDbEventArgs } from '~/generated/graphql';

type OnDbEventArgs = SubscriptionOnDbEventArgs & {
  skip?: boolean;
  onData?: (data: Subscription) => void;
  onError?: (err: any) => void;
  onComplete?: () => void;
};

export const useOnDbEvent = ({
  onData,
  onError,
  onComplete,
  input,
  skip = false,
}: OnDbEventArgs) => {
  const tokenPair = getTokenPair();

  const sseClient = useMemo(() => {
    return createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      headers: {
        Authorization: tokenPair?.accessOrWorkspaceAgnosticToken.token
          ? `Bearer ${tokenPair?.accessOrWorkspaceAgnosticToken.token}`
          : '',
      },
    });
  }, [tokenPair?.accessOrWorkspaceAgnosticToken.token]);

  useEffect(() => {
    if (skip === true) {
      return;
    }
    const next = (value: { data: Subscription }) => onData?.(value.data);
    const error = (err: unknown) => onError?.(err);
    const complete = () => onComplete?.();
    const unsubscribe = sseClient.subscribe(
      {
        query: ON_DB_EVENT.loc?.source.body || '',
        variables: { input },
      },
      {
        next,
        error,
        complete,
      },
    );

    return () => {
      unsubscribe();
    };
  }, [input, onComplete, onData, onError, skip, sseClient]);
};
