import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnApplicationSdkClientChecksumsUpdated } from '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useGetLogicFunctionHttpUrl } from '@/settings/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
  GetApplicationSdkClientChecksumsDocument,
} from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  frontComponentId: string;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
};

type ResolvedFrontComponent = NonNullable<
  FindOneFrontComponentQuery['frontComponent']
>;

type FrontComponentRendererContentProps = {
  frontComponent: ResolvedFrontComponent;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
}: FrontComponentRendererProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useEffect(() => {
    if (isDefined(error)) {
      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${error.message}`,
      });
    }
  }, [error, enqueueErrorSnackBar]);

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const frontComponent = data?.frontComponent;

  if (loading || !isDefined(frontComponent)) {
    return null;
  }

  return (
    <FrontComponentRendererContent
      frontComponent={frontComponent}
      commandMenuItemId={commandMenuItemId}
      selectedRecordIds={selectedRecordIds}
    />
  );
};

const FrontComponentRendererContent = ({
  frontComponent,
  commandMenuItemId,
  selectedRecordIds,
}: FrontComponentRendererContentProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { functionsBaseUrl } = useGetLogicFunctionHttpUrl();

  const { id: frontComponentId, applicationId, usesSdkClient } = frontComponent;

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

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${error.message}`,
      });
    },
    [enqueueErrorSnackBar],
  );

  const applicationTokenPair = frontComponent.applicationTokenPair ?? null;

  useEffect(() => {
    if (isDefined(applicationTokenPair)) {
      setFrontComponentApplicationTokenPair(applicationTokenPair);
    }
  }, [applicationTokenPair, setFrontComponentApplicationTokenPair]);

  const { data: sdkClientChecksumsData, loading: sdkClientChecksumsLoading } =
    useQuery(GetApplicationSdkClientChecksumsDocument, {
      variables: { applicationId },
      skip: !usesSdkClient,
    });

  useOnApplicationSdkClientChecksumsUpdated({
    applicationId,
  });

  const sdkClientChecksums =
    sdkClientChecksumsData?.applicationSdkClientChecksums;

  const sdkClientUrls = useMemo(
    () => getSdkClientUrls(applicationId, sdkClientChecksums),
    [applicationId, sdkClientChecksums],
  );

  if (
    !isDefined(applicationTokenPair) ||
    (usesSdkClient && sdkClientChecksumsLoading)
  ) {
    return null;
  }

  const componentUrl = getFrontComponentUrl({
    frontComponentId,
    checksum: frontComponent.builtComponentChecksum,
  });

  const accessToken = applicationTokenPair.applicationAccessToken.token;

  const applicationVariables = frontComponent.applicationVariables ?? undefined;

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
