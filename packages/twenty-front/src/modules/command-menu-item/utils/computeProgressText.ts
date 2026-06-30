import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';

export const computeProgressText = (
  progress?: ObjectRecordQueryProgress,
): string => {
  if (
    !isDefined(progress) ||
    !isDefined(progress.processedRecordCount) ||
    progress.processedRecordCount === 0
  ) {
    return '';
  }

  if (isDefined(progress.totalRecordCount)) {
    const percentage =
      progress.totalRecordCount > 0
        ? Math.round(
            (progress.processedRecordCount / progress.totalRecordCount) * 100,
          )
        : 0;

    return ` (${percentage}%)`;
  }

  return ` (${progress.processedRecordCount})`;
};
