import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type ErrorLike } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

// Apollo v4 queries no longer support an onError callback.
export const useToastOnQueryError = ({
  error,
  message,
}: {
  error: ErrorLike | undefined;
  message?: string;
}) => {
  const { enqueueToast } = useToast();

  useEffect(() => {
    if (!isDefined(error)) {
      return;
    }

    enqueueToast(
      getToastOptionsFromError({
        error,
        ...(isNonEmptyString(message) ? { children: message } : undefined),
      }),
    );
  }, [error, enqueueToast, message]);
};
