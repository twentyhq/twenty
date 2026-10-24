import { useEffect } from 'react';

import { handleAppError } from '@/error-handler/utils/handleAppError';

type AppRouteErrorReportEffectProps = {
  error: Error;
};

export const AppRouteErrorReportEffect = ({
  error,
}: AppRouteErrorReportEffectProps) => {
  useEffect(() => {
    handleAppError({ error });
  }, [error]);

  return <></>;
};
