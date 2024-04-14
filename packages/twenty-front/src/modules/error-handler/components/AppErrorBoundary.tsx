import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from '@emotion/react';
import { THEME_LIGHT } from 'twenty-ui';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleError = (_error: Error, _info: ErrorInfo) => {
    // TODO: log error to Sentry
  };

  return (
    <ThemeProvider theme={THEME_LIGHT}>
      <ErrorBoundary
        FallbackComponent={GenericErrorFallback}
        onError={handleError}
      >
        {children}
      </ErrorBoundary>
    </ThemeProvider>
  );
};
