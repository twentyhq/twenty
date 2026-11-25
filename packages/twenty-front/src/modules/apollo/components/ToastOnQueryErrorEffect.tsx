import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type ErrorLike } from '@apollo/client';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ToastOptions, useToast } from 'twenty-ui/components/feedback';

type ToastOnQueryErrorEffectProps = Pick<ToastOptions, 'dedupeKey'> & {
  error: ErrorLike | undefined;
  message?: string;
};

export const ToastOnQueryErrorEffect = ({
  error,
  message,
  dedupeKey,
}: ToastOnQueryErrorEffectProps) => {
  const { enqueueToast } = useToast();

  useEffect(() => {
    if (!isDefined(error)) {
      return;
    }

    enqueueToast(
      getToastOptionsFromError({ error, children: message, dedupeKey }),
    );
  }, [error, enqueueToast, message, dedupeKey]);

  return null;
};
