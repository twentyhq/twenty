import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect } from 'react';

// Utility hook to show an error snackbar when a query returns an error.
// Replaces the removed onError callback from useQuery in Apollo v4.
//
// TODO: Consider moving generic error→snackbar handling into the centralized
// Apollo error link (apollo.factory.ts) which already handles auth errors,
// Sentry, retries, etc. This would eliminate the need for per-component
// useEffect calls. Keep this hook only for call sites that need a custom
// error message (e.g. useWebhookForm, SettingsAdminWorkerMetricsGraph).
export const useSnackBarOnQueryError = (
  error: Error | CombinedGraphQLErrors | undefined,
  message?: string,
) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (!error) return;

    enqueueErrorSnackBar(
      message
        ? { message }
        : {
            apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
          },
    );
  }, [error, enqueueErrorSnackBar, message]);
};
