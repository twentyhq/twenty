import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/display';

export const useCopyJsonValue = () => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();

  const copyJsonValue = (valueAsString: string) => {
    navigator.clipboard.writeText(valueAsString);

    enqueueSnackBar(t`JSON value copied to clipboard`, {
      variant: SnackBarVariant.Success,
      icon: <IconCopy size={theme.icon.size.md} />,
      duration: 2000,
    });
  };

  return { copyJsonValue };
};
