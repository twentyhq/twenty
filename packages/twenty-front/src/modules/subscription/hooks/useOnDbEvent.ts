import { useEffect } from 'react';
import { createClient } from 'graphql-sse';
import { ON_DB_EVENT } from '@/subscription/graphql/subscriptions/onDbEvent';
import { Subscription, SubscriptionOnDbEventArgs } from '~/generated/graphql';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getTokenPair } from '@/apollo/utils/getTokenPair';

type OnDbEventArgs = SubscriptionOnDbEventArgs & {
  skip?: boolean;
  onData?: (data: Subscription) => void;
  onError?: (err: any) => void;
  onComplete?: () => void;
};

const tokenPair = getTokenPair();

const sseClient = createClient({
  url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
  headers: {
    Authorization: tokenPair?.accessToken.token
      ? `Bearer ${tokenPair?.accessToken.token}`
      : '',
  },
});

export const useOnDbEvent = ({
  onData,
  onError,
  onComplete,
  input,
  skip = false,
}: OnDbEventArgs) => {
  useEffect(() => {
    if (skip === true) {
      return;
    }
    const next = (event: any) => onData?.(event.data);
    const error = (err: any) => onError?.(err);
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
  }, [input, onComplete, onData, onError, skip]);
};
