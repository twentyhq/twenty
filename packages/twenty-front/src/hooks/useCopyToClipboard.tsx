import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useState, useCallback, useContext } from 'react';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const useCopyToClipboard = (resetTimeout = 2000) => {
  const { theme } = useContext(ThemeContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (valueAsString: string, message?: string) => {
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
      setIsCopied(true);

      enqueueSuccessSnackBar({
        message: message || t`Copied to clipboard`,
        options: {
          icon: <IconCopy size={theme.icon.size.md} />,
          duration: resetTimeout,
        },
      });

      setTimeout(() => setIsCopied(false), resetTimeout);
    } catch {
      enqueueErrorSnackBar({
        message: t`Couldn't copy to clipboard`,
        options: {
          icon: <IconExclamationCircle size={16} color="red" />,
          duration: 3000,
        },
      });
    }
  }, [theme, enqueueSuccessSnackBar, enqueueErrorSnackBar, t, resetTimeout]);

  return { copyToClipboard, isCopied };
};
        options: {
          icon: <IconExclamationCircle size={16} color="red" />,
          duration: 2000,
        },
      });
    }
  };

  return { copyToClipboard };
};
