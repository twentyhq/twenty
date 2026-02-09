import { getMockFrontComponentUrl } from '@/front-components/utils/mockFrontComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';

type FrontComponentRendererProps = {
  frontComponentId: string;
};

export const FrontComponentRenderer = ({
  frontComponentId: _frontComponentId,
}: FrontComponentRendererProps) => {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  const { enqueueErrorSnackBar } = useSnackBar();
  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext();

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
      theme={theme}
      componentUrl={getMockFrontComponentUrl()}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
      onError={handleError}
    />
  );
};
