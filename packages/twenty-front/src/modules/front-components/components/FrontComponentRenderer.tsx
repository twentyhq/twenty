import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
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
  const apolloMetadataClient = useApolloCoreClient();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext();

  const componentUrl = `${REST_API_BASE_URL}/front-components/${frontComponentId}`;
  const authToken = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;

  const handleLoadError = useCallback(
    (error: Error) => {
      const errorMessage = error.message;

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    },
    [enqueueErrorSnackBar],
  );

  const handleRendererError = useCallback(
    (componentError?: Error) => {
      if (isDefined(componentError)) {
        const message = componentError.message;

        enqueueErrorSnackBar({
          message: t`Failed to load front component: ${message}`,
        });
      }
    },
    [enqueueErrorSnackBar],
  );

  const { data, loading } = useFindOneFrontComponentQuery({
    client: apolloMetadataClient,
    variables: { id: frontComponentId },
    onError: handleLoadError,
  });

  if (
    loading === true ||
    !isDefined(data?.frontComponent) ||
    !isDefined(authToken)
  ) {
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
      onError={handleRendererError}
    />
  );
};
