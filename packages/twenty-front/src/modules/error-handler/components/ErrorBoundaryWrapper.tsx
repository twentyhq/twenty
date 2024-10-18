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
  const isSettingsRoute = location.pathname.startsWith('/settings');

  return (
    <AppErrorBoundary isSettingsRoute={isSettingsRoute}>
      {children}
    </AppErrorBoundary>
  );
};
