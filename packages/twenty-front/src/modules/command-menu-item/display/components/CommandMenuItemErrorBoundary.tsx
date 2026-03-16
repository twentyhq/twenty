import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type CommandMenuItemErrorBoundaryProps = {
  children: ReactNode;
  resetKeys?: unknown[];
  shouldReportToSentry?: boolean;
};

export const CommandMenuItemErrorBoundary = ({
  children,
  resetKeys,
  shouldReportToSentry = false,
}: CommandMenuItemErrorBoundaryProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleError = async (error: Error) => {
    enqueueErrorSnackBar({ message: error.message });

    if (!shouldReportToSentry) {
      return;
    }

    try {
      const { captureException } = await import('@sentry/react');
      captureException(error, (scope) => {
        scope.setTag('component', 'CommandMenuItem');

        return scope;
      });
    } catch {
      // oxlint-disable-next-line no-console
      console.error('Failed to capture exception with Sentry:', error);
    }
  };

  return (
    <ErrorBoundary
      fallbackRender={() => null}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};
