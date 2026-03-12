import { type CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';
import { type SnackBarOptions } from '@/ui/feedback/snack-bar-manager/states/snackBarInternalComponentState';

export const buildErrorAction = (
  apolloError?: CombinedGraphQLErrors,
): Pick<SnackBarOptions, 'actionText' | 'actionTo'> | null => {
  if (!apolloError) {
    return null;
  }

  const conflictingRecord = getConflictingRecordFromApolloError(apolloError);

  if (isDefined(conflictingRecord)) {
    return {
      actionText: t`View existing record`,
      actionTo: getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: conflictingRecord.conflictingObjectNameSingular,
        objectRecordId: conflictingRecord.conflictingRecordId,
      }),
    };
  }

  return null;
};
