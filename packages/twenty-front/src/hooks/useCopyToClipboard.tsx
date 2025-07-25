import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/display';

export const useCopyToClipboard = () => {
  const theme = useTheme();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyToClipboard = async (valueAsString: string, message?: string) => {
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
