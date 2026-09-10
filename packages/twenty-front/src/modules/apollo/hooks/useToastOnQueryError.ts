import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { type ErrorLike } from '@apollo/client';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Apollo v4 queries no longer support an onError callback.
export const useToastOnQueryError = (
  error: ErrorLike | undefined,
  message?: string,
) => {
  const { enqueueErrorToast } = useErrorToast();

  useEffect(() => {
    if (!isDefined(error)) {
      return;
    }

    enqueueErrorToast(error, message ? { children: message } : undefined);
  }, [error, enqueueErrorToast, message]);
};
