import * as Sentry from '@sentry/react';
import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';
import { RecordIndexErrorFallback } from '@/error-handler/components/RecordIndexErrorFallback';
import { RecordShowErrorFallback } from '@/error-handler/components/RecordShowErrorFallback';
import { SettingsErrorFallback } from '@/error-handler/components/SettingsErrorFallback';
import { ErrorFallbackType } from '@/error-handler/utils/errorFallbackType';

type AppErrorBoundaryProps = {
  children: ReactNode;
  errorFallbackType?: ErrorFallbackType;
};

const getFallbackComponent = (type: ErrorFallbackType) => {
  switch (type) {
    case ErrorFallbackType.Settings:
      return SettingsErrorFallback;
    case ErrorFallbackType.RecordShow:
      return RecordShowErrorFallback;
    case ErrorFallbackType.RecordIndex:
      return RecordIndexErrorFallback;
    default:
      return GenericErrorFallback;
  }
};

export const AppErrorBoundary = ({
  children,
  errorFallbackType = ErrorFallbackType.Default,
}: AppErrorBoundaryProps) => {
  const handleError = (_error: Error, _info: ErrorInfo) => {
    Sentry.captureException(_error, (scope) => {
      scope.setExtras({ _info });
      return scope;
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={getFallbackComponent(errorFallbackType)}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
