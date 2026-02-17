import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/display';

const fallbackCopyToClipboard = (text: string): boolean => {
  const textArea = document.createElement('textarea');

  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');

    return successful;
  } finally {
    document.body.removeChild(textArea);
  }
};

const canUseClipboardApi = (): boolean => {
  return window.isSecureContext === true && navigator.clipboard !== undefined;
};

export const useCopyToClipboard = () => {
  const theme = useTheme();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyToClipboard = async (valueAsString: string, message?: string) => {
    try {
      if (canUseClipboardApi()) {
        await navigator.clipboard.writeText(valueAsString);
      } else {
        const successful = fallbackCopyToClipboard(valueAsString);

        if (successful !== true) {
          throw new Error('execCommand copy failed');
        }
      }

      enqueueSuccessSnackBar({
        message: message || t`Copied to clipboard`,
        options: {
          icon: <IconCopy size={theme.icon.size.md} />,
          duration: 2000,
        },
      });
    } catch {
      const isInsecureContext = window.isSecureContext !== true;

      enqueueErrorSnackBar({
        message: isInsecureContext
          ? t`Clipboard requires a secure connection (HTTPS). Please access this app over HTTPS to enable copying.`
          : t`Couldn't copy to clipboard`,
        options: {
          icon: <IconExclamationCircle size={16} color="red" />,
          duration: isInsecureContext ? 6000 : 2000,
        },
      });
    }
  };

  return { copyToClipboard };
};
