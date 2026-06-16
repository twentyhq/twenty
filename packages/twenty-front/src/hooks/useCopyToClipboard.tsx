import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui-deprecated/display';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui-deprecated/theme-constants';

const copyToClipboardWithTextArea = (valueAsString: string) => {
  if (typeof document.execCommand !== 'function') {
    return false;
  }

  const textarea = document.createElement('textarea');

  textarea.value = valueAsString;
  textarea.setAttribute('readonly', '');
  textarea.style.opacity = '0';
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
};

export const useCopyToClipboard = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyToClipboard = async (valueAsString: string, message?: string) => {
    const isClipboardApiAvailable =
      window.isSecureContext &&
      typeof navigator.clipboard?.writeText === 'function';

    let hasCopied = false;

    if (isClipboardApiAvailable) {
      try {
        await navigator.clipboard.writeText(valueAsString);
        hasCopied = true;
      } catch {
        hasCopied = false;
      }
    }

    if (!hasCopied) {
      hasCopied = copyToClipboardWithTextArea(valueAsString);
    }

    if (hasCopied) {
      enqueueSuccessSnackBar({
        message: message || t`Copied to clipboard`,
        options: {
          icon: <IconCopy size={theme.icon.size.md} />,
          duration: 2000,
        },
      });

      return;
    }

    enqueueErrorSnackBar({
      message: window.isSecureContext
        ? t`Couldn't copy to clipboard`
        : t`Clipboard requires a secure connection (HTTPS). Please access this app over HTTPS to enable copying.`,
      options: {
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: window.isSecureContext ? 2000 : 6000,
      },
    });
  };

  return { copyToClipboard };
};
