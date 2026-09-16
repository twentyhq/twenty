import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { isErrorLike } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type ToastOptions } from 'twenty-ui/primitives/feedback';

import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

type GetToastOptionsFromErrorParams = Omit<ToastOptions, 'variant'> & {
  error: unknown;
};

export const getToastOptionsFromError = ({
  error,
  ...options
}: GetToastOptionsFromErrorParams): ToastOptions | undefined => {
  const errorLike = isErrorLike(error) ? error : undefined;

  if (errorLike?.name === 'AbortError') {
    return;
  }

  const conflictingRecord = isDefined(errorLike)
    ? getConflictingRecordFromApolloError(errorLike)
    : null;

  return {
    ...options,
    children:
      options.children ??
      (isDefined(errorLike)
        ? getErrorMessageFromApolloError(errorLike)
        : t`An error occurred.`),
    action:
      options.action ??
      (isDefined(conflictingRecord) ? (
        <NavigationButton
          to={getAppPath(AppPath.RecordShowPage, {
            objectNameSingular: conflictingRecord.conflictingObjectNameSingular,
            objectRecordId: conflictingRecord.conflictingRecordId,
          })}
          variant="ghost"
          size="sm"
        >
          {t`View existing record`}
        </NavigationButton>
      ) : undefined),
    variant: 'error',
  };
};
