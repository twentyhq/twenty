import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider, useTheme } from '@emotion/react';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleError = (_error: Error, _info: ErrorInfo) => {
    // TODO: log error to Sentry
  };

  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary
        FallbackComponent={GenericErrorFallback}
        onError={handleError}
      >
        {children}
      </ErrorBoundary>
    </ThemeProvider>
  );
};
