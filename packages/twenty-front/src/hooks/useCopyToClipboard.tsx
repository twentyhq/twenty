import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, IconExclamationCircle } from 'twenty-ui/display';

export const useCopyToClipboard = () => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyToClipboard = async (valueAsString: string) => {
    try {
      await navigator.clipboard.writeText(valueAsString);

      enqueueSnackBar(t`Copied to clipboard`, {
        variant: SnackBarVariant.Success,
        icon: <IconCopy size={theme.icon.size.md} />,
        duration: 2000,
      });
    } catch {
      enqueueSnackBar(t`Couldn't copy to clipboard`, {
        variant: SnackBarVariant.Error,
        icon: <IconExclamationCircle size={16} color="red" />,
        duration: 2000,
      });
    }
  };

  return { copyToClipboard };
};
