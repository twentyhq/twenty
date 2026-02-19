import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/display';

export const useCopyToClipboard = () => {
  const theme = useTheme();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyToClipboard = async (valueAsString: string, message?: string) => {
    if (!window.isSecureContext) {
      enqueueErrorSnackBar({
        message: t`Clipboard requires a secure connection (HTTPS). Please access this app over HTTPS to enable copying.`,
        options: {
          icon: <IconExclamationCircle size={16} color="red" />,
          duration: 6000,
        },
      });

      return;
    }

    try {
      await navigator.clipboard.writeText(valueAsString);

      enqueueSuccessSnackBar({
        message: message || t`Copied to clipboard`,
        options: {
          icon: <IconCopy size={theme.icon.size.md} />,
          duration: 2000,
        },
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Couldn't copy to clipboard`,
        options: {
          icon: <IconExclamationCircle size={16} color="red" />,
          duration: 2000,
        },
      });
    }
  };

  return { copyToClipboard };
};
