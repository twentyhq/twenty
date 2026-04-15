import { type ErrorLike } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';
import { type SnackBarOptions } from '@/ui/feedback/snack-bar-manager/states/snackBarInternalComponentState';

export const buildErrorAction = (
  apolloError?: ErrorLike,
): Pick<SnackBarOptions, 'buttonLabel' | 'buttonOnClick'> | null => {
  if (!apolloError) {
    return null;
  }

  const conflictingRecord = getConflictingRecordFromApolloError(apolloError);

  if (isDefined(conflictingRecord)) {
    const recordPath = getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: conflictingRecord.conflictingObjectNameSingular,
      objectRecordId: conflictingRecord.conflictingRecordId,
    });

    return {
      buttonLabel: t`View existing record`,
      buttonOnClick: () => {
        window.location.href = recordPath;
      },
    };
  }

  return null;
};
