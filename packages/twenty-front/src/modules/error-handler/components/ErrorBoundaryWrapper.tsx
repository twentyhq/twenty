import { getErrorFallbackType } from '@/error-handler/utils/errorFallbackType';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppErrorBoundary } from './AppErrorBoundary';

type ErrorBoundaryWrapperProps = {
  children: ReactNode;
};

export const ErrorBoundaryWrapper = ({
  children,
}: ErrorBoundaryWrapperProps) => {
  const location = useLocation();
  // const isSettingsRoute = location.pathname.startsWith('/settings');
  const errorFallbackType = getErrorFallbackType(location.pathname);
  return (
    // <AppErrorBoundary isSettingsRoute={isSettingsRoute}>
    // <AppErrorBoundary>{children}</AppErrorBoundary>
    <AppErrorBoundary
      key={location.pathname}
      errorFallbackType={errorFallbackType}
    >
      {children}
    </AppErrorBoundary>
  );
};
