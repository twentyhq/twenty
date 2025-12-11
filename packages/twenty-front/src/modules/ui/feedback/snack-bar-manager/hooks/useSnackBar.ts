import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import {
  snackBarInternalComponentState,
  type SnackBarOptions,
} from '@/ui/feedback/snack-bar-manager/states/snackBarInternalComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { getConflictingRecordFromApolloError } from '~/utils/get-conflicting-record-from-apollo-error.util';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useSnackBar = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    SnackBarComponentInstanceContext,
  );

  const handleSnackBarClose = useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(
          snackBarInternalComponentState.atomFamily({
            instanceId: componentInstanceId,
          }),
          (prevState) => ({
            ...prevState,
            queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
          }),
        );
      },
    [componentInstanceId],
  );

  const setSnackBarQueue = useRecoilCallback(
    ({ set }) =>
      (newValue: SnackBarOptions) =>
        set(
          snackBarInternalComponentState.atomFamily({
            instanceId: componentInstanceId,
          }),
          (prev) => {
            if (
              isDefined(newValue.dedupeKey) &&
              prev.queue.some(
                (snackBar) => snackBar.dedupeKey === newValue.dedupeKey,
              )
            ) {
              return prev;
            }

            if (prev.queue.length >= prev.maxQueue) {
              return {
                ...prev,
                queue: [...prev.queue.slice(1), newValue] as SnackBarOptions[],
              };
            }

            return {
              ...prev,
              queue: [...prev.queue, newValue] as SnackBarOptions[],
            };
          },
        ),
    [componentInstanceId],
  );

  const enqueueSuccessSnackBar = useCallback(
    ({
      message,
      options,
    }: {
      message: string;
      options?: Omit<SnackBarOptions, 'message' | 'id'>;
    }) => {
      setSnackBarQueue({
        id: uuidv4(),
        message,
        ...options,
        variant: SnackBarVariant.Success,
      });
    },
    [setSnackBarQueue],
  );

  const enqueueInfoSnackBar = useCallback(
    ({
      message,
      options,
    }: {
      message: string;
      options?: Omit<SnackBarOptions, 'message' | 'id'>;
    }) => {
      setSnackBarQueue({
        id: uuidv4(),
        message,
        ...options,
        variant: SnackBarVariant.Info,
      });
    },
    [setSnackBarQueue],
  );

  const enqueueWarningSnackBar = useCallback(
    ({
      message,
      options,
    }: {
      message: string;
      options?: Omit<SnackBarOptions, 'message' | 'id'>;
    }) => {
      setSnackBarQueue({
        id: uuidv4(),
        message,
        ...options,
        variant: SnackBarVariant.Warning,
      });
    },
    [setSnackBarQueue],
  );

  const enqueueErrorSnackBar = useCallback(
    ({
      apolloError,
      message,
      options,
    }: (
      | { apolloError: ApolloError; message?: never }
      | { apolloError?: never; message?: string }
    ) & {
      options?: Omit<SnackBarOptions, 'message' | 'id'>;
    }) => {
      if (apolloError?.networkError?.name === 'AbortError') {
        return;
      }

      const errorMessage = message
        ? message
        : apolloError
          ? getErrorMessageFromApolloError(apolloError)
          : t`An error occurred.`;

      const conflictingRecord = apolloError
        ? getConflictingRecordFromApolloError(apolloError)
        : null;

      const link = conflictingRecord
        ? {
            href: getAppPath(AppPath.RecordShowPage, {
              objectNameSingular:
                conflictingRecord.conflictingObjectNameSingular,
              objectRecordId: conflictingRecord.conflictingRecordId,
            }),
            text: t`View existing record`,
          }
        : undefined;

      setSnackBarQueue({
        id: uuidv4(),
        message: errorMessage,
        ...options,
        link,
        variant: SnackBarVariant.Error,
      });
    },
    [setSnackBarQueue],
  );

  return {
    handleSnackBarClose,
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  };
};
