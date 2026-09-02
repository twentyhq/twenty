import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
export const useCopyToClipboard = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const writeToClipboard = async (
    valueAsString: string,
    successMessage: string | null,
  ) => {
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

      if (!isDefined(successMessage)) {
        return;
      }

      enqueueSuccessSnackBar({
        message: successMessage,
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

  const copyToClipboard = async (valueAsString: string, message?: string) =>
    await writeToClipboard(valueAsString, message || t`Copied to clipboard`);

  const copyToClipboardWithoutSuccessSnackBar = async (valueAsString: string) =>
    await writeToClipboard(valueAsString, null);

  return { copyToClipboard, copyToClipboardWithoutSuccessSnackBar };
};
