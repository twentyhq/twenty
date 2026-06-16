import { useCallback } from 'react';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export type PropelToastVariant = 'success' | 'error' | 'info' | 'warning';

// Thin adapter over Twenty's snackbar manager so the builder can call a single
// `notify(message, variant)` (the ergonomics the Propel in-sandbox builder used)
// while still routing through the CRM's real snackbar UI. The SnackBarProvider
// wraps the whole authenticated router (AppRouterProviders), so this is safe to
// call from any route page.
export const usePropelToast = () => {
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  } = useSnackBar();

  return useCallback(
    (message: string, variant: PropelToastVariant = 'info') => {
      switch (variant) {
        case 'success':
          enqueueSuccessSnackBar({ message });
          break;
        case 'error':
          enqueueErrorSnackBar({ message });
          break;
        case 'warning':
          enqueueWarningSnackBar({ message });
          break;
        default:
          enqueueInfoSnackBar({ message });
      }
    },
    [
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      enqueueInfoSnackBar,
      enqueueWarningSnackBar,
    ],
  );
};
