import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnApplicationSdkClientChecksumsUpdated } from '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import { FrontComponentMediaSessionRegistrationEffect } from '@/front-components/media-session/components/FrontComponentMediaSessionRegistrationEffect';
import { FrontComponentMediaPermissionModal } from '@/front-components/media-session/components/FrontComponentMediaPermissionModal';
import { useFrontComponentMediaSession } from '@/front-components/media-session/hooks/useFrontComponentMediaSession';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useGetLogicFunctionHttpUrl } from '@/settings/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-front-component-renderer';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { useThemeColorScheme } from 'twenty-ui/theme';
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
  timelineActivityId?: string;
  toolCall?: FrontComponentToolCall;
  loadingFallback?: ReactNode;
  unavailableFallback?: ReactNode;
};

type ResolvedFrontComponent = NonNullable<
  FindOneFrontComponentQuery['frontComponent']
>;

type FrontComponentRendererContentProps = {
  frontComponent: ResolvedFrontComponent;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  timelineActivityId?: string;
  toolCall?: FrontComponentToolCall;
  loadingFallback?: ReactNode;
  unavailableFallback?: ReactNode;
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
  timelineActivityId,
  toolCall,
  loadingFallback,
  unavailableFallback,
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
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {loading && loadingFallback}
      {!loading &&
        (!isDefined(frontComponent) || isDefined(error)) &&
        unavailableFallback}
      {!loading && isDefined(frontComponent) && !isDefined(error) && (
        <FrontComponentRendererContent
          key={frontComponent.id}
          frontComponent={frontComponent}
          commandMenuItemId={commandMenuItemId}
          selectedRecordIds={selectedRecordIds}
          timelineActivityId={timelineActivityId}
          toolCall={toolCall}
          loadingFallback={loadingFallback}
          unavailableFallback={unavailableFallback}
        />
      )}
    </>
  );
};

const FrontComponentRendererContent = ({
  frontComponent,
  commandMenuItemId,
  selectedRecordIds,
  timelineActivityId,
  toolCall,
  loadingFallback,
  unavailableFallback,
}: FrontComponentRendererContentProps) => {
  const colorScheme = useThemeColorScheme();
  const { enqueueToast } = useToast();
  const { functionsBaseUrl } = useGetLogicFunctionHttpUrl();

  const {
    id: frontComponentId,
    applicationId,
    applicationName,
    usesSdkClient,
    frontComponentSharedDependenciesChecksum,
  } = frontComponent;

  const {
    executionContext,
    frontComponentHostCommunicationApi,
    storageNamespace,
  } = useFrontComponentExecutionContext({
    frontComponentId,
    applicationId,
    commandMenuItemId,
    selectedRecordIds,
    timelineActivityId,
    toolCall,
    colorScheme,
  });

  const resolvedApplicationName = applicationName ?? frontComponent.name;
  const {
    activeSessions,
    mediaSessionHost,
    pendingStartMediaTypes,
    stopMediaSession,
    permissionModalInstanceId,
    permissionRequest,
  } = useFrontComponentMediaSession({
    frontComponentId,
  });

  const handleError = useCallback(
    (error?: Error) => {
      if (!isDefined(error)) {
        return;
      }

      enqueueToast({
        variant: 'error',
        children: t`Failed to load front component: ${error.message}`,
      });
    },
    [enqueueToast],
  );

  // The worker is created once with these values and refreshes its token
  // through the host, so a renewal or refetch must not re-create it
  const [initialApplicationVariables] = useState(
    () => frontComponent.applicationVariables ?? undefined,
  );
  const [initialApplicationTokenPair, setInitialApplicationTokenPair] =
    useState<FrontComponentApplicationTokenPair | null>(null);
  const [applicationTokenPairLoadError, setApplicationTokenPairLoadError] =
    useState<Error | null>(null);

  const handleApplicationTokenPairLoaded = useCallback(
    (loadedApplicationTokenPair: FrontComponentApplicationTokenPair) => {
      setInitialApplicationTokenPair(
        (currentApplicationTokenPair) =>
          currentApplicationTokenPair ?? loadedApplicationTokenPair,
      );
    },
    [],
  );

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

  const sharedDependenciesUrl = getFingerprintedRestUrl({
    resource: 'front-component-shared-dependencies',
    id: applicationId,
    checksum: frontComponentSharedDependenciesChecksum ?? undefined,
  });

  const componentUrl = getFingerprintedRestUrl({
    resource: 'front-components',
    id: frontComponentId,
    checksum: frontComponent.builtComponentChecksum,
  });

  const isSdkClientReady = !usesSdkClient || !sdkClientChecksumsLoading;
  const isReadyToRender =
    isDefined(initialApplicationTokenPair) && isSdkClientReady;

  return (
    <>
      {isDefined(permissionRequest) && (
        <FrontComponentMediaPermissionModal
          applicationId={applicationId}
          applicationName={resolvedApplicationName}
          modalInstanceId={permissionModalInstanceId}
          request={permissionRequest}
        />
      )}
      <FrontComponentMediaSessionRegistrationEffect
        activeSessions={activeSessions}
        applicationId={applicationId}
        applicationName={resolvedApplicationName}
        pendingStartMediaTypes={pendingStartMediaTypes}
        onStop={stopMediaSession}
      />
      <FrontComponentApplicationTokenPairEffect
        applicationId={applicationId}
        onApplicationTokenPairLoaded={handleApplicationTokenPairLoaded}
        onApplicationTokenPairLoadFailed={setApplicationTokenPairLoadError}
      />
      <FrontComponentLoadErrorToastEffect
        errorMessage={applicationTokenPairLoadError?.message}
      />
      {isDefined(applicationTokenPairLoadError) && unavailableFallback}
      {!isDefined(applicationTokenPairLoadError) &&
        !isReadyToRender &&
        loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererProvider frontComponentId={frontComponentId}>
          <SharedFrontComponentRenderer
            colorScheme={colorScheme}
            componentUrl={componentUrl}
            applicationAccessToken={
              initialApplicationTokenPair.applicationAccessToken.token
            }
            apiUrl={REACT_APP_SERVER_BASE_URL}
            functionsBaseUrl={functionsBaseUrl}
            sdkClientUrls={sdkClientUrls}
            sharedDependenciesUrl={sharedDependenciesUrl}
            executionContext={executionContext}
            frontComponentHostCommunicationApi={
              frontComponentHostCommunicationApi
            }
            mediaSessionHost={mediaSessionHost}
            applicationVariables={initialApplicationVariables}
            storageNamespace={storageNamespace}
            onError={handleError}
            loadingFallback={loadingFallback}
          />
        </FrontComponentRendererProvider>
      )}
    </>
  );
};
