import { ON_FRONT_COMPONENT_UPDATED } from '@/front-components/graphql/subscriptions/onFrontComponentUpdated';
import { SseClientContext } from '@/sse-db-event/contexts/SseClientContext';
import { useContext, useEffect } from 'react';

type OnFrontComponentUpdatedData = {
  onFrontComponentUpdated: {
    id: string;
    builtComponentChecksum: string;
    updatedAt: string;
  };
};

type UseOnFrontComponentUpdatedArgs = {
  frontComponentId: string;
  onData?: (data: OnFrontComponentUpdatedData) => void;
  onError?: (err: unknown) => void;
  onComplete?: () => void;
  skip?: boolean;
};

export const useOnFrontComponentUpdated = ({
  frontComponentId,
  onData,
  onError,
  onComplete,
  skip = false,
}: UseOnFrontComponentUpdatedArgs) => {
  const sseClient = useContext(SseClientContext);

  useEffect(() => {
    if (skip) {
      return;
    }

    const next = (value: { data: OnFrontComponentUpdatedData }) =>
      onData?.(value.data);

    const error = (error: unknown) => onError?.(error);

    const complete = () => onComplete?.();

    const unsubscribe = sseClient?.subscribe(
      {
        query: ON_FRONT_COMPONENT_UPDATED.loc?.source.body || '',
        variables: { input: { id: frontComponentId } },
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
  }, [frontComponentId, onComplete, onData, onError, skip, sseClient]);
};
