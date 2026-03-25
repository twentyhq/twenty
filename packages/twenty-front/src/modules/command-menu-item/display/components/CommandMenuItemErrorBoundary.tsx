import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type CommandMenuItemErrorBoundaryProps = {
  children: ReactNode;
  shouldReportToSentry?: boolean;
  onError?: () => void;
};

export const CommandMenuItemErrorBoundary = ({
  children,
  shouldReportToSentry = false,
  onError,
}: CommandMenuItemErrorBoundaryProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

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
      resetKeys={[commandMenuItemId]}
    >
      {children}
    </ErrorBoundary>
  );
};
