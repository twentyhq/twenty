import { useChangeQueryListenState } from '@/sse-db-event/hooks/useChangeQueryListenState';
import { useEffect } from 'react';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';

export const useListenToEventsForQuery = ({
  queryId,
  operationSignature,
  skip = false,
}: {
  queryId: string;
  operationSignature:
    | RecordGqlOperationSignature
    | MetadataGqlOperationSignature;
  skip?: boolean;
}) => {
  const { changeQueryIdListenState } = useChangeQueryListenState();

  useEffect(() => {
    if (skip) {
      return;
    }

    changeQueryIdListenState(true, queryId, operationSignature);

    return () => {
      changeQueryIdListenState(false, queryId, operationSignature);
    };
  }, [changeQueryIdListenState, queryId, operationSignature, skip]);
};
