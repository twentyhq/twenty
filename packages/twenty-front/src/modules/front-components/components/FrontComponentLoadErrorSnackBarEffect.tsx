import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentLoadErrorSnackBarEffectProps = {
  errorMessage?: string;
};

export const FrontComponentLoadErrorSnackBarEffect = ({
  errorMessage,
}: FrontComponentLoadErrorSnackBarEffectProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    }
  }, [errorMessage, enqueueErrorSnackBar]);

  return null;
};
