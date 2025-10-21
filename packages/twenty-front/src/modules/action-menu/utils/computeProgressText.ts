import { isDefined } from 'twenty-shared/utils';

import { type QueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';

export const computeProgressText = (progress?: QueryProgress): string => {
  if (
    !isDefined(progress) ||
    !isDefined(progress.processedRecordCount) ||
    progress.processedRecordCount === 0
  ) {
    return '';
  }

  if (isDefined(progress.totalRecordCount)) {
    const percentage = Math.round(
      (progress.processedRecordCount / progress.totalRecordCount) * 100,
    );

    return ` (${percentage}%)`;
  }

  return ` (${progress.processedRecordCount})`;
};
