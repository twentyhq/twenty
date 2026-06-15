import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui-deprecated/display';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui-deprecated/theme-constants';

const copyToClipboardWithExecCommand = (valueAsString: string) => {
  const activeElement = document.activeElement;
  const selection = document.getSelection();
  const selectedRanges =
    selection === null
      ? []
      : Array.from({ length: selection.rangeCount }, (_, index) =>
          selection.getRangeAt(index),
        );
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
  } finally {
    document.body.removeChild(textarea);
    selection?.removeAllRanges();
    selectedRanges.forEach((range) => selection?.addRange(range));

    if (activeElement instanceof HTMLElement) {
      activeElement.focus();
    }
  }
};

export const useCopyToClipboard = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyToClipboard = async (valueAsString: string, message?: string) => {
    const enqueueSuccess = () => {
      enqueueSuccessSnackBar({
        message: message || t`Copied to clipboard`,
        options: {
          icon: <IconCopy size={theme.icon.size.md} />,
          duration: 2000,
        },
      });
    };

    if (copyToClipboardWithExecCommand(valueAsString)) {
      enqueueSuccess();
      return;
    }

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

      enqueueSuccess();
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
