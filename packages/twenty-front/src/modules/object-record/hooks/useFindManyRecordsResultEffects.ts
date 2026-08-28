import { type ErrorLike } from '@apollo/client';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';

// TODO: Refactor these useEffects to avoid unnecessary re-renders (see PR #18584 review)
export const useFindManyRecordsResultEffects = ({
  data,
  error,
  handleFindManyRecordsCompleted,
  handleFindManyRecordsError,
}: {
  data: RecordGqlOperationFindManyResult | undefined;
  error: ErrorLike | undefined;
  handleFindManyRecordsCompleted: (
    data: RecordGqlOperationFindManyResult,
  ) => void;
  handleFindManyRecordsError: (error: ErrorLike) => void;
}) => {
  useEffect(() => {
    if (isDefined(data)) {
      handleFindManyRecordsCompleted(data);
    }
  }, [data, handleFindManyRecordsCompleted]);

  useEffect(() => {
    if (isDefined(error)) {
      handleFindManyRecordsError(error);
    }
  }, [error, handleFindManyRecordsError]);
};
