import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type ErrorLike } from '@apollo/client';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

type ToastOnQueryErrorEffectProps = {
  error: ErrorLike | undefined;
  message?: string;
};

export const ToastOnQueryErrorEffect = ({
  error,
  message,
}: ToastOnQueryErrorEffectProps) => {
  const { enqueueToast } = useToast();

  useEffect(() => {
    if (!isDefined(error)) {
      return;
    }

    enqueueToast(getToastOptionsFromError({ error, children: message }));
  }, [error, enqueueToast, message]);

  return null;
};
