import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { type SnackBarOptions } from '@/ui/feedback/snack-bar-manager/types/SnackBarOptions';
import { getToastPropsFromSnackBarProps } from '@/ui/feedback/snack-bar-manager/utils/getToastPropsFromSnackBarProps';
import { buildErrorAction } from '@/ui/feedback/snack-bar-manager/utils/buildErrorAction';
import { type ErrorLike } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { i18n } from '@lingui/core';
import { useToast } from 'twenty-ui/feedback';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useSnackBar = () => {
  const { add, close: handleSnackBarClose } = useToast();

  const setSnackBarQueue = useCallback(
    (options: SnackBarOptions) =>
      add(getToastPropsFromSnackBarProps(options, i18n)),
    [add],
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
      | { apolloError: ErrorLike; message?: never }
      | { apolloError?: never; message?: string }
    ) & {
      options?: Omit<SnackBarOptions, 'message' | 'id'>;
    }) => {
      if (apolloError?.name === 'AbortError') {
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
