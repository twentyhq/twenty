import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type CommandMenuItemErrorBoundaryProps = {
  children: ReactNode;
  engineCommandId: string;
  shouldReportToSentry?: boolean;
  onError?: () => void;
};

export const CommandMenuItemErrorBoundary = ({
  children,
  engineCommandId,
  shouldReportToSentry = false,
  onError,
}: CommandMenuItemErrorBoundaryProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleError = async (error: Error) => {
    enqueueErrorSnackBar({ message: error.message });

    if (shouldReportToSentry) {
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
    }

    onError?.();
  };

  return (
    <ErrorBoundary
      fallbackRender={() => null}
      onError={handleError}
      resetKeys={[engineCommandId]}
    >
      {children}
    </ErrorBoundary>
  );
};
