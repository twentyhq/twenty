import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentRendererProps = {
  frontComponentId: string;
};

export const FrontComponentRenderer = ({
  frontComponentId,
}: FrontComponentRendererProps) => {
  const [hasError, setHasError] = useState(false);

  const { enqueueErrorSnackBar } = useSnackBar();

  const handleError = (error?: Error) => {
    if (isDefined(error)) {
      const errorMessage = error.message;

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    }
    setHasError(true);
  };

  if (hasError) {
    return null;
  }

  return (
    <FrontComponentContent
      componentUrl={getFrontComponentUrl(frontComponentId)}
      onError={handleError}
    />
  );
};
