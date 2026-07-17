import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useGetLogicFunctionHttpUrl } from '@/settings/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useQuery } from '@apollo/client/react';
import { FindOneFrontComponentDocument } from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  frontComponentId: string;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
}: FrontComponentRendererProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();

  const { functionsBaseUrl } = useGetLogicFunctionHttpUrl();

  const setFrontComponentApplicationTokenPair = useSetAtomComponentState(
    frontComponentApplicationTokenPairComponentState,
    frontComponentId,
  );

  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext({
      frontComponentId,
      commandMenuItemId,
      selectedRecordIds,
      colorScheme,
    });

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

  const applicationTokenPair =
    data?.frontComponent?.applicationTokenPair ?? null;

  useEffect(() => {
    if (isDefined(applicationTokenPair)) {
      setFrontComponentApplicationTokenPair(applicationTokenPair);
    }
  }, [applicationTokenPair, setFrontComponentApplicationTokenPair]);

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const applicationId = data?.frontComponent?.applicationId;

  const sdkClientUrls = useMemo(
    () =>
      isDefined(applicationId) ? getSdkClientUrls(applicationId) : undefined,
    [applicationId],
  );

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

  const accessToken = applicationTokenPair.applicationAccessToken.token;

  const applicationVariables =
    data.frontComponent.applicationVariables ?? undefined;

  return (
    <FrontComponentRendererProvider frontComponentId={frontComponentId}>
      <SharedFrontComponentRenderer
        colorScheme={colorScheme}
        componentUrl={componentUrl}
        applicationAccessToken={accessToken}
        apiUrl={REACT_APP_SERVER_BASE_URL}
        functionsBaseUrl={functionsBaseUrl}
        sdkClientUrls={sdkClientUrls}
        executionContext={executionContext}
        frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
        applicationVariables={applicationVariables}
        onError={handleError}
      />
    </FrontComponentRendererProvider>
  );
};
