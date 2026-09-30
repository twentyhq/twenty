import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ToastOptions } from 'twenty-ui/components';

const getGraphQLErrorCode = (
  error: CombinedGraphQLErrors,
): string | undefined => {
  const extensions = error.errors[0]?.extensions;
  const code = extensions?.subCode ?? extensions?.code;

  return isNonEmptyString(code) ? code : undefined;
};

export const getTwoFactorAuthenticationErrorToastOptions = ({
  error,
  fallbackMessage = t`Invalid verification code. Please try again.`,
  dedupeKey,
}: {
  error: unknown;
  fallbackMessage?: string;
  dedupeKey?: string;
}): ToastOptions | undefined => {
  if (!CombinedGraphQLErrors.is(error)) {
    return {
      variant: 'error',
      children: fallbackMessage,
      dedupeKey,
    };
  }

  const errorCode = getGraphQLErrorCode(error);

  return getToastOptionsFromError({
    error,
    dedupeKey:
      isNonEmptyString(dedupeKey) && isNonEmptyString(errorCode)
        ? `${dedupeKey}-${errorCode}`
        : dedupeKey,
  });
};
