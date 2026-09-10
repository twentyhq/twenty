import { isErrorLike } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type ToastOptions } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';

import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

type GetToastOptionsFromErrorParams = Omit<ToastOptions, 'variant'> & {
  error: unknown;
};

export const getToastOptionsFromError = ({
  error,
  ...options
}: GetToastOptionsFromErrorParams): ToastOptions | undefined => {
  if (isErrorLike(error) && error.name === 'AbortError') {
    return;
  }

  const conflictingRecord = isErrorLike(error)
    ? getConflictingRecordFromApolloError(error)
    : null;

  return {
    children: isErrorLike(error)
      ? getErrorMessageFromApolloError(error)
      : t`An error occurred.`,
    action: isDefined(conflictingRecord) ? (
      <Button
        to={getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: conflictingRecord.conflictingObjectNameSingular,
          objectRecordId: conflictingRecord.conflictingRecordId,
        })}
        title={t`View existing record`}
        ariaLabel={t`View existing record`}
        variant="tertiary"
        size="small"
      />
    ) : undefined,
    ...options,
    variant: 'error',
  };
};
