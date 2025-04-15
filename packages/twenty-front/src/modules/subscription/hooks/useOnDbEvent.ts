import { useEffect } from 'react';
import { createClient, Client } from 'graphql-sse';
import { ON_DB_EVENT } from '@/subscription/graphql/subscriptions/onDbEvent';
import { DatabaseEventAction } from '~/generated/graphql';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type OnDbEventArgs = {
  input: {
    action?: DatabaseEventAction;
    objectNameSingular?: string;
    recordId?: string;
  };
  skip?: boolean;
  onData?: (data: any) => void;
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
  useEffect(() => {
    if (skip) {
      return;
    }
    const next = (data: any) => onData?.(data);
    const error = (err: any) => onError?.(err);
    const complete = () => onComplete?.();
    const sseClient: Client = createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
    });
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
