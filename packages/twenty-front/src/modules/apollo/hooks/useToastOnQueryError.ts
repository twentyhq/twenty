import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type ErrorLike } from '@apollo/client';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';

// Apollo v4 queries no longer support an onError callback.
export const useToastOnQueryError = (
  error: ErrorLike | undefined,
  message?: string,
) => {
  const { enqueueToast } = useToast();

  useEffect(() => {
    if (!isDefined(error)) {
      return;
    }

    enqueueToast(
      getToastOptionsFromError({
        error,
        ...(message ? { children: message } : undefined),
      }),
    );
  }, [error, enqueueToast, message]);
};
