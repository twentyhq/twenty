import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentLoadErrorSnackBarEffect } from '@/front-components/components/FrontComponentLoadErrorSnackBarEffect';
import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnApplicationSdkClientChecksumsUpdated } from '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { useRequestFrontComponentExternalNavigation } from '@/front-components/hooks/useRequestFrontComponentExternalNavigation';
import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useGetLogicFunctionHttpUrl } from '@/settings/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useCallback, useContext, useMemo } from 'react';
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
  loadingFallback?: ReactNode;
};

type ResolvedFrontComponent = NonNullable<
  FindOneFrontComponentQuery['frontComponent']
>;

type FrontComponentRendererContentProps = {
  frontComponent: ResolvedFrontComponent;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  loadingFallback?: ReactNode;
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
  loadingFallback,
}: FrontComponentRendererProps) => {
  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const frontComponent = data?.frontComponent;

  return (
    <>
      <FrontComponentLoadErrorSnackBarEffect errorMessage={error?.message} />
      {loading && loadingFallback}
      {!loading && isDefined(frontComponent) && (
        <FrontComponentRendererContent
          frontComponent={frontComponent}
          commandMenuItemId={commandMenuItemId}
          selectedRecordIds={selectedRecordIds}
          loadingFallback={loadingFallback}
        />
      )}
    </>
  );
};

const FrontComponentRendererContent = ({
  frontComponent,
  commandMenuItemId,
  selectedRecordIds,
  loadingFallback,
}: FrontComponentRendererContentProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { functionsBaseUrl } = useGetLogicFunctionHttpUrl();

  const { id: frontComponentId, applicationId, usesSdkClient } = frontComponent;

  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext({
      frontComponentId,
      commandMenuItemId,
      selectedRecordIds,
      colorScheme,
    });

  const requestExternalNavigation = useRequestFrontComponentExternalNavigation({
    applicationId,
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

  const { data: sdkClientChecksumsData, loading: sdkClientChecksumsLoading } =
    useQuery(GetApplicationSdkClientChecksumsDocument, {
      variables: { applicationId },
      skip: !usesSdkClient,
    });

  useOnApplicationSdkClientChecksumsUpdated({
    applicationId,
    skip: !usesSdkClient,
  });

  const sdkClientChecksums =
    sdkClientChecksumsData?.applicationSdkClientChecksums;

  const sdkClientUrls = useMemo(
    () => getSdkClientUrls(applicationId, sdkClientChecksums),
    [applicationId, sdkClientChecksums],
  );

  const componentUrl = getFrontComponentUrl({
    frontComponentId,
    checksum: frontComponent.builtComponentChecksum,
  });

  const applicationVariables = frontComponent.applicationVariables ?? undefined;

  const isSdkClientReady = !usesSdkClient || !sdkClientChecksumsLoading;
  const isReadyToRender = isDefined(applicationTokenPair) && isSdkClientReady;

  return (
    <>
      <FrontComponentApplicationTokenPairEffect
        frontComponentId={frontComponentId}
        applicationTokenPair={applicationTokenPair}
      />
      {!isReadyToRender && loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererProvider frontComponentId={frontComponentId}>
          <SharedFrontComponentRenderer
            colorScheme={colorScheme}
            componentUrl={componentUrl}
            applicationAccessToken={
              applicationTokenPair.applicationAccessToken.token
            }
            apiUrl={REACT_APP_SERVER_BASE_URL}
            functionsBaseUrl={functionsBaseUrl}
            sdkClientUrls={sdkClientUrls}
            executionContext={executionContext}
            frontComponentHostCommunicationApi={
              frontComponentHostCommunicationApi
            }
            onRequestExternalNavigation={requestExternalNavigation}
            applicationVariables={applicationVariables}
            onError={handleError}
            loadingFallback={loadingFallback}
          />
        </FrontComponentRendererProvider>
      )}
    </>
  );
};
