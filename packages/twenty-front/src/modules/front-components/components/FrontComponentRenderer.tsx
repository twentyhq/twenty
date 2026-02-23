import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import {
  type FrontComponentHostCommunicationApi,
  FrontComponentRenderer as SharedFrontComponentRenderer,
} from 'twenty-sdk/front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
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
    useFrontComponentExecutionContext({ frontComponentId });

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

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const componentUrl = getFrontComponentUrl({
    frontComponentId,
    checksum: data?.frontComponent?.builtComponentChecksum,
  });

  const applicationTokenPair =
    data?.frontComponent?.applicationTokenPair ?? null;

  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });

  const composedFrontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      ...frontComponentHostCommunicationApi,
      requestAccessTokenRefresh,
    };

  if (
    loading ||
    !isDefined(data?.frontComponent) ||
    !isDefined(applicationTokenPair)
  ) {
    return null;
  }

  return (
    <SharedFrontComponentRenderer
      theme={theme}
      componentUrl={componentUrl}
      applicationAccessToken={applicationTokenPair.applicationAccessToken.token}
      apiUrl={REACT_APP_SERVER_BASE_URL}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={
        composedFrontComponentHostCommunicationApi
      }
      onError={handleError}
    />
  );
};
