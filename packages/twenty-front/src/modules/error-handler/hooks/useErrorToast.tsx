import { isErrorLike } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type ToastOptions, useToast } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useErrorToast = () => {
  const { add } = useToast();

  const addErrorToast = useCallback(
    (error: unknown, options?: Omit<ToastOptions, 'variant'>) => {
      if (isErrorLike(error) && error.name === 'AbortError') {
        return;
      }

      const conflictingRecord = isErrorLike(error)
        ? getConflictingRecordFromApolloError(error)
        : null;

      return add({
        children: isErrorLike(error)
          ? getErrorMessageFromApolloError(error)
          : t`An error occurred.`,
        action: isDefined(conflictingRecord) ? (
          <Button
            to={getAppPath(AppPath.RecordShowPage, {
              objectNameSingular:
                conflictingRecord.conflictingObjectNameSingular,
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
      });
    },
    [add],
  );

  return { addErrorToast };
};
