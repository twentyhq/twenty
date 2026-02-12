import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';
import { useFindOneFrontComponentQuery } from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  frontComponentId: string;
};

export const FrontComponentRenderer = ({
  frontComponentId,
}: FrontComponentRendererProps) => {
  const theme = useTheme();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext();

  const componentUrl = `${REST_API_BASE_URL}/front-components/${frontComponentId}`;
  const authToken = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;

  const handleError = useCallback(
    (error?: Error) => {
      if (!isDefined(error)) {
        return;
      }

      const errorMessage = error.message;

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    },
    [enqueueErrorSnackBar],
  );

  const { data, loading } = useFindOneFrontComponentQuery({
    variables: { id: frontComponentId },
    onError: handleError,
  });

  if (loading || !isDefined(data?.frontComponent) || !isDefined(authToken)) {
    return null;
  }

  const { applicationAccessToken, applicationRefreshToken, apiUrl } =
    data.frontComponent;

  return (
    <SharedFrontComponentRenderer
      theme={theme}
      componentUrl={componentUrl}
      authToken={authToken}
      applicationAccessToken={applicationAccessToken ?? undefined}
      applicationRefreshToken={applicationRefreshToken ?? undefined}
      apiUrl={apiUrl ?? undefined}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
      onError={handleError}
    />
  );
};
