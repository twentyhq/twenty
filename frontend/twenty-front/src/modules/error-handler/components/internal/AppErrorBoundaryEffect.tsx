import { useEffect, useState } from 'react';
import { type FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AppErrorBoundaryEffectProps = Pick<FallbackProps, 'resetErrorBoundary'>;

export const AppErrorBoundaryEffect = ({
  resetErrorBoundary,
}: AppErrorBoundaryEffectProps) => {
  const location = useLocation();

  const [previousLocation] = useState(location);

  useEffect(() => {
    if (!isDeeplyEqual(previousLocation, location)) {
      resetErrorBoundary();
    }
  }, [previousLocation, location, resetErrorBoundary]);

  return <></>;
};
