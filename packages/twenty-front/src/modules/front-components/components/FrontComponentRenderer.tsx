import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { FrontComponentRendererWithSdkClient } from '@/front-components/components/FrontComponentRendererWithSdkClient';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { useCallback, useContext, useEffect } from 'react';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-sdk/front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useQuery } from '@apollo/client/react';
import { FindOneFrontComponentDocument } from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  frontComponentId: string;
  commandMenuItemId?: string;
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
}: FrontComponentRendererProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();

  const setFrontComponentApplicationTokenPair = useSetAtomComponentState(
    frontComponentApplicationTokenPairComponentState,
    frontComponentId,
  );

  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext({ frontComponentId, commandMenuItemId });

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

  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  useEffect(() => {
    if (data) {
      const tokenPair = data.frontComponent?.applicationTokenPair;

      if (isDefined(tokenPair)) {
        setFrontComponentApplicationTokenPair(tokenPair);
      }
    }
  }, [data, setFrontComponentApplicationTokenPair]);

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const applicationTokenPair =
    data?.frontComponent?.applicationTokenPair ?? null;

  if (
    loading ||
    !isDefined(data?.frontComponent) ||
    !isDefined(applicationTokenPair)
  ) {
    return null;
  }

  const componentUrl = getFrontComponentUrl({
    frontComponentId,
    checksum: data.frontComponent.builtComponentChecksum,
  });

  const usesSdkClient = data.frontComponent.usesSdkClient;

  const accessToken = applicationTokenPair.applicationAccessToken.token;

  if (usesSdkClient) {
    return (
      <FrontComponentRendererProvider frontComponentId={frontComponentId}>
        <FrontComponentRendererWithSdkClient
          colorScheme={colorScheme}
          componentUrl={componentUrl}
          applicationAccessToken={accessToken}
          applicationId={data.frontComponent.applicationId}
          executionContext={executionContext}
          frontComponentHostCommunicationApi={
            frontComponentHostCommunicationApi
          }
          onError={handleError}
        />
      </FrontComponentRendererProvider>
    );
  }

  return (
    <FrontComponentRendererProvider frontComponentId={frontComponentId}>
      <SharedFrontComponentRenderer
        colorScheme={colorScheme}
        componentUrl={componentUrl}
        applicationAccessToken={accessToken}
        apiUrl={REACT_APP_SERVER_BASE_URL}
        executionContext={executionContext}
        frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
        onError={handleError}
      />
    </FrontComponentRendererProvider>
  );
};
