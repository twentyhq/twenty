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

  const children =
    options.children ??
    (isDefined(errorLike)
      ? getErrorMessageFromApolloError(errorLike)
      : t`An error occurred.`);

  // Nested handlers often report the same failure; while its toast is visible, a repeat collapses into it.
  // A conflict carries a record-specific action, so conflicts on different records stay separate.
  const defaultDedupeKey =
    typeof children === 'string'
      ? isDefined(conflictingRecord)
        ? `${children}:${conflictingRecord.conflictingRecordId}`
        : children
      : undefined;

  const dedupeKey = options.dedupeKey ?? defaultDedupeKey;

  return {
    ...options,
    children,
    dedupeKey,
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
