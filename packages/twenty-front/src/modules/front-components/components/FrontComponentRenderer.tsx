import { useState } from 'react';

import { getMockFrontComponentUrl } from '@/front-components/utils/mockFrontComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentRendererProps = {
  frontComponentId: string;
};

export const FrontComponentRenderer = ({
  frontComponentId: _frontComponentId,
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
    <SharedFrontComponentRenderer
      componentUrl={getMockFrontComponentUrl()}
      onError={handleError}
    />
  );
};
