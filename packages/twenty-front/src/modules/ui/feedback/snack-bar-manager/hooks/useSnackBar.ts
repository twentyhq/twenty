import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import {
  snackBarInternalComponentState,
  type SnackBarOptions,
} from '@/ui/feedback/snack-bar-manager/states/snackBarInternalComponentState';
import { buildErrorAction } from '@/ui/feedback/snack-bar-manager/utils/build-error-action.util';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useSnackBar = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    SnackBarComponentInstanceContext,
  );

  const store = useStore();

  const handleSnackBarClose = useCallback(
    (id: string) => {
      store.set(
        snackBarInternalComponentState.atomFamily({
          instanceId: componentInstanceId,
        }),
        (prevState) => ({
          ...prevState,
          queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
        }),
      );
    },
    [componentInstanceId, store],
  );

  const setSnackBarQueue = useCallback(
    (newValue: SnackBarOptions) =>
      store.set(
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
    [componentInstanceId, store],
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

      const errorAction = buildErrorAction(apolloError);

      setSnackBarQueue({
        id: uuidv4(),
        message: errorMessage,
        ...errorAction,
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
