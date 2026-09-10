import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';

type FrontComponentLoadErrorToastEffectProps = {
  errorMessage?: string;
};

export const FrontComponentLoadErrorToastEffect = ({
  errorMessage,
}: FrontComponentLoadErrorToastEffectProps) => {
  const { add: addToast } = useToast();

  useEffect(() => {
    if (isDefined(errorMessage)) {
      addToast({
        variant: 'error',
        children: t`Failed to load front component: ${errorMessage}`,
      });
    }
  }, [errorMessage, addToast]);

  return null;
};
