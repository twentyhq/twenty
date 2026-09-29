import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { type ToastOptions } from 'twenty-ui/components';

export const getTwoFactorVerificationErrorToastOptions = ({
  error,
  dedupeKey,
}: {
  error: unknown;
  dedupeKey?: string;
}): ToastOptions | undefined =>
  CombinedGraphQLErrors.is(error)
    ? getToastOptionsFromError({ error, dedupeKey })
    : {
        variant: 'error',
        children: t`Invalid verification code. Please try again.`,
        dedupeKey,
      };
