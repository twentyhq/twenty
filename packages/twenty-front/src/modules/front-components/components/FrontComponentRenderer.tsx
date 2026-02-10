import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
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
  frontComponentId,
}: FrontComponentRendererProps) => {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  const { enqueueErrorSnackBar } = useSnackBar();
  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext();

  const componentUrl = `${REST_API_BASE_URL}/front-components/${frontComponentId}`;
  const authToken = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;

  const handleError = (error?: Error) => {
    if (isDefined(error)) {
      const errorMessage = error.message;

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    }
    setHasError(true);
  };

  if (hasError || !isDefined(authToken)) {
    // TODO: Add an error display component here
    return null;
  }

  return (
    <SharedFrontComponentRenderer
      theme={theme}
      componentUrl={componentUrl}
      authToken={authToken}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
      onError={handleError}
    />
  );
};
