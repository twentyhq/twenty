import { type ErrorLike } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const isCoreRecordAbsent = ({
  record,
  loading,
  error,
}: {
  record: ObjectRecord | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}) => !loading && !isDefined(error) && !isDefined(record);
