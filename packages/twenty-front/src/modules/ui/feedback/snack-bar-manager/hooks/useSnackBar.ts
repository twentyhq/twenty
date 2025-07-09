import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { SnackBarManagerScopeInternalContext } from '@/ui/feedback/snack-bar-manager/scopes/scope-internal-context/SnackBarManagerScopeInternalContext';
import {
  snackBarInternalScopedState,
  SnackBarOptions,
} from '@/ui/feedback/snack-bar-manager/states/snackBarInternalScopedState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useSnackBar = () => {
  const scopeId = useAvailableScopeIdOrThrow(
    SnackBarManagerScopeInternalContext,
  );

  const handleSnackBarClose = useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(snackBarInternalScopedState({ scopeId }), (prevState) => ({
          ...prevState,
          queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
        }));
      },
    [scopeId],
  );

  const setSnackBarQueue = useRecoilCallback(
    ({ set }) =>
      (newValue: SnackBarOptions) =>
        set(snackBarInternalScopedState({ scopeId }), (prev) => {
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
        }),
    [scopeId],
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
      setSnackBarQueue({
        id: uuidv4(),
        message: errorMessage,
        ...options,
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
