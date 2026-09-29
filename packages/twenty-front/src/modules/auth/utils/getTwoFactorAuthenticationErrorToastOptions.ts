import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { type ToastOptions } from 'twenty-ui/components';

export const getTwoFactorAuthenticationErrorToastOptions = ({
  error,
  fallbackMessage = t`Invalid verification code. Please try again.`,
  dedupeKey,
}: {
  error: unknown;
  fallbackMessage?: string;
  dedupeKey?: string;
}): ToastOptions | undefined =>
  CombinedGraphQLErrors.is(error)
    ? getToastOptionsFromError({ error, dedupeKey })
    : {
        variant: 'error',
        children: fallbackMessage,
        dedupeKey,
      };
