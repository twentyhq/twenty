import { useCallback } from 'react';

import { type SnackBarOptions } from '@/ui/feedback/snack-bar-manager/types/SnackBarOptions';
import { buildErrorAction } from '@/ui/feedback/snack-bar-manager/utils/buildErrorAction';
import { getToastPropsFromSnackBarProps } from '@/ui/feedback/snack-bar-manager/utils/getToastPropsFromSnackBarProps';
import { type ErrorLike } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/feedback';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useSnackBar = () => {
  const { add } = useToast();

  const addSnackBar = useCallback(
    (options: SnackBarOptions) => {
      add(getToastPropsFromSnackBarProps(options));
    },
    [add],
  );

  const enqueueSuccessSnackBar = useCallback(
    ({
      message,
      options,
    }: {
      message: string;
      options?: Omit<SnackBarOptions, 'message'>;
    }) => {
      addSnackBar({
        message,
        ...options,
        variant: 'success',
      });
    },
    [addSnackBar],
  );

  const enqueueInfoSnackBar = useCallback(
    ({
      message,
      options,
    }: {
      message: string;
      options?: Omit<SnackBarOptions, 'message'>;
    }) => {
      addSnackBar({
        message,
        ...options,
        variant: 'info',
      });
    },
    [addSnackBar],
  );

  const enqueueWarningSnackBar = useCallback(
    ({
      message,
      options,
    }: {
      message: string;
      options?: Omit<SnackBarOptions, 'message'>;
    }) => {
      addSnackBar({
        message,
        ...options,
        variant: 'warning',
      });
    },
    [addSnackBar],
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
      options?: Omit<SnackBarOptions, 'message'>;
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

      addSnackBar({
        message: errorMessage,
        ...errorAction,
        ...options,
        variant: 'error',
      });
    },
    [addSnackBar],
  );

  return {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  };
};
