import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const ErrorCatchAll = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary fallback={<h1>Something went wrong</h1>}>
      {children}
    </ErrorBoundary>
  );
};
