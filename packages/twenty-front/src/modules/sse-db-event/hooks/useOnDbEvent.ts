import { SseClientContext } from '@/sse-db-event/contexts/SseClientContext';
import { ON_DB_EVENT } from '@/sse-db-event/graphql/subscriptions/onDbEvent';
import { useContext, useEffect } from 'react';
import {
  type Subscription,
  type SubscriptionOnDbEventArgs,
} from '~/generated-metadata/graphql';

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
  const sseClient = useContext(SseClientContext);

  useEffect(() => {
    if (skip === true) {
      return;
    }
    const next = (value: { data: Subscription }) => onData?.(value.data);
    const error = (err: unknown) => onError?.(err);
    const complete = () => onComplete?.();

    const unsubscribe = sseClient?.subscribe(
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
      unsubscribe?.();
    };
  }, [input, onComplete, onData, onError, skip, sseClient]);
};
