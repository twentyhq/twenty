import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { FrontComponentSourcesPreloadEffect } from '@/front-components/components/FrontComponentSourcesPreloadEffect';
import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useOnApplicationSdkClientChecksumsUpdated } from '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import { type PreloadedFrontComponentSources } from '@/front-components/types/PreloadedFrontComponentSources';
import { FrontComponentMediaSessionRegistrationEffect } from '@/front-components/media-session/components/FrontComponentMediaSessionRegistrationEffect';
import { FrontComponentMediaPermissionModal } from '@/front-components/media-session/components/FrontComponentMediaPermissionModal';
import { useFrontComponentMediaSession } from '@/front-components/media-session/hooks/useFrontComponentMediaSession';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useGetLogicFunctionHttpUrl } from '@/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import {
  type FrontComponentSources,
  FrontComponentRenderer as SharedFrontComponentRenderer,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
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
  selectedRecordsFilter?: RecordGqlOperationFilter | null;
  objectNameSingular?: string;
  timelineActivityId?: string;
  toolCall?: FrontComponentToolCall;
  onToolCallArgumentsChange?: (toolArguments: Record<string, unknown>) => void;
  loadingFallback?: ReactNode;
  unavailableFallback?: ReactNode;
  errorFallback?: ReactNode;
  shouldPreventPageZoom?: boolean;
};

type ResolvedFrontComponent = NonNullable<
  FindOneFrontComponentQuery['frontComponent']
>;

type LoadableFrontComponent = Pick<
  FlatFrontComponent,
  | 'id'
  | 'applicationId'
  | 'builtComponentChecksum'
  | 'usesSdkClient'
  | 'frontComponentSharedDependenciesChecksum'
>;

type FrontComponentRendererLoaderProps = {
  loadableFrontComponent: LoadableFrontComponent;
  fetchedFrontComponent?: ResolvedFrontComponent;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  selectedRecordsFilter?: RecordGqlOperationFilter | null;
  objectNameSingular?: string;
  timelineActivityId?: string;
  toolCall?: FrontComponentToolCall;
  onToolCallArgumentsChange?: (toolArguments: Record<string, unknown>) => void;
  loadingFallback?: ReactNode;
  unavailableFallback?: ReactNode;
  errorFallback?: ReactNode;
  shouldPreventPageZoom?: boolean;
};

type FrontComponentRendererContentProps = {
  frontComponent: ResolvedFrontComponent;
  applicationAccessToken: string;
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  usesSharedDependencies: boolean;
  preloadedSources?: Promise<FrontComponentSources | undefined>;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  selectedRecordsFilter?: RecordGqlOperationFilter | null;
  objectNameSingular?: string;
  timelineActivityId?: string;
  toolCall?: FrontComponentToolCall;
  onToolCallArgumentsChange?: (toolArguments: Record<string, unknown>) => void;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  shouldPreventPageZoom?: boolean;
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
  selectedRecordsFilter,
  objectNameSingular,
  timelineActivityId,
  toolCall,
  onToolCallArgumentsChange,
  loadingFallback,
  unavailableFallback,
  errorFallback,
  shouldPreventPageZoom,
}: FrontComponentRendererProps) => {
  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const storedFrontComponent = useAtomStateValue(frontComponentsSelector).find(
    (frontComponent) => frontComponent.id === frontComponentId,
  );

  const fetchedFrontComponent =
    loading || isDefined(error)
      ? undefined
      : (data?.frontComponent ?? undefined);

  const isUnavailable = !loading && !isDefined(fetchedFrontComponent);

  const loadableFrontComponent = fetchedFrontComponent ?? storedFrontComponent;

  return (
    <>
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {!isUnavailable && !isDefined(loadableFrontComponent) && loadingFallback}
      {isUnavailable && unavailableFallback}
      {!isUnavailable && isDefined(loadableFrontComponent) && (
        <FrontComponentRendererLoader
          key={loadableFrontComponent.id}
          loadableFrontComponent={loadableFrontComponent}
          fetchedFrontComponent={fetchedFrontComponent}
          commandMenuItemId={commandMenuItemId}
          selectedRecordIds={selectedRecordIds}
          selectedRecordsFilter={selectedRecordsFilter}
          objectNameSingular={objectNameSingular}
          timelineActivityId={timelineActivityId}
          toolCall={toolCall}
          onToolCallArgumentsChange={onToolCallArgumentsChange}
          loadingFallback={loadingFallback}
          unavailableFallback={unavailableFallback}
          errorFallback={errorFallback}
          shouldPreventPageZoom={shouldPreventPageZoom}
        />
      )}
    </>
  );
};

const FrontComponentRendererLoader = ({
  loadableFrontComponent,
  fetchedFrontComponent,
  commandMenuItemId,
  selectedRecordIds,
  selectedRecordsFilter,
  objectNameSingular,
  timelineActivityId,
  toolCall,
  onToolCallArgumentsChange,
  loadingFallback,
  unavailableFallback,
  errorFallback,
  shouldPreventPageZoom,
}: FrontComponentRendererLoaderProps) => {
  const {
    id: frontComponentId,
    applicationId,
    builtComponentChecksum,
    usesSdkClient,
    frontComponentSharedDependenciesChecksum,
  } = loadableFrontComponent;

  const [initialApplicationTokenPair, setInitialApplicationTokenPair] =
    useState<FrontComponentApplicationTokenPair | null>(null);
  const [applicationTokenPairLoadError, setApplicationTokenPairLoadError] =
    useState<Error | null>(null);
  const [preloadedSources, setPreloadedSources] =
    useState<PreloadedFrontComponentSources | null>(null);

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

  const usesSharedDependencies = isDefined(
    frontComponentSharedDependenciesChecksum,
  );

  const sharedDependenciesUrl = getFingerprintedRestUrl({
    resource: 'front-component-shared-dependencies',
    id: applicationId,
    checksum: frontComponentSharedDependenciesChecksum ?? undefined,
  });

  const componentUrl = getFingerprintedRestUrl({
    resource: 'front-components',
    id: frontComponentId,
    checksum: builtComponentChecksum,
  });

  const isSdkClientReady = !usesSdkClient || !sdkClientChecksumsLoading;
  const canFetchSources =
    isDefined(initialApplicationTokenPair) && isSdkClientReady;
  const isReadyToRender = canFetchSources && isDefined(fetchedFrontComponent);

  const arePreloadedSourcesCurrent =
    isDefined(preloadedSources) &&
    preloadedSources.componentUrl === componentUrl &&
    preloadedSources.sdkClientUrls === sdkClientUrls &&
    preloadedSources.sharedDependenciesUrl === sharedDependenciesUrl;

  return (
    <>
      <FrontComponentApplicationTokenPairEffect
        applicationId={applicationId}
        onApplicationTokenPairLoaded={handleApplicationTokenPairLoaded}
        onApplicationTokenPairLoadFailed={setApplicationTokenPairLoadError}
      />
      <FrontComponentLoadErrorToastEffect
        errorMessage={applicationTokenPairLoadError?.message}
      />
      {canFetchSources && !isReadyToRender && !arePreloadedSourcesCurrent && (
        <FrontComponentSourcesPreloadEffect
          componentUrl={componentUrl}
          sdkClientUrls={sdkClientUrls}
          sharedDependenciesUrl={sharedDependenciesUrl}
          applicationAccessToken={
            initialApplicationTokenPair.applicationAccessToken.token
          }
          usesSdkClient={usesSdkClient}
          usesSharedDependencies={usesSharedDependencies}
          onSourcesPreloadStarted={setPreloadedSources}
        />
      )}
      {isDefined(applicationTokenPairLoadError) && unavailableFallback}
      {!isDefined(applicationTokenPairLoadError) &&
        !isReadyToRender &&
        loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererContent
          frontComponent={fetchedFrontComponent}
          applicationAccessToken={
            initialApplicationTokenPair.applicationAccessToken.token
          }
          componentUrl={componentUrl}
          sdkClientUrls={sdkClientUrls}
          sharedDependenciesUrl={sharedDependenciesUrl}
          usesSharedDependencies={usesSharedDependencies}
          preloadedSources={
            arePreloadedSourcesCurrent
              ? preloadedSources.sourcesPromise
              : undefined
          }
          commandMenuItemId={commandMenuItemId}
          selectedRecordIds={selectedRecordIds}
          selectedRecordsFilter={selectedRecordsFilter}
          objectNameSingular={objectNameSingular}
          timelineActivityId={timelineActivityId}
          toolCall={toolCall}
          onToolCallArgumentsChange={onToolCallArgumentsChange}
          loadingFallback={loadingFallback}
          errorFallback={errorFallback}
          shouldPreventPageZoom={shouldPreventPageZoom}
        />
      )}
    </>
  );
};

const FrontComponentRendererContent = ({
  frontComponent,
  applicationAccessToken,
  componentUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
  usesSharedDependencies,
  preloadedSources,
  commandMenuItemId,
  selectedRecordIds,
  selectedRecordsFilter,
  objectNameSingular,
  timelineActivityId,
  toolCall,
  onToolCallArgumentsChange,
  loadingFallback,
  errorFallback,
  shouldPreventPageZoom,
}: FrontComponentRendererContentProps) => {
  const colorScheme = useThemeColorScheme();
  const { enqueueToast } = useToast();
  const { functionsBaseUrl } = useGetLogicFunctionHttpUrl();

  const {
    id: frontComponentId,
    applicationId,
    applicationName,
    usesSdkClient,
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
    selectedRecordsFilter,
    objectNameSingular,
    timelineActivityId,
    toolCall,
    onToolCallArgumentsChange,
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
        status: 'error',
        children: t`Failed to load front component: ${error.message}`,
      });
    },
    [enqueueToast],
  );

  const [initialApplicationVariables] = useState(
    () => frontComponent.applicationVariables ?? undefined,
  );

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
      <FrontComponentRendererProvider
        frontComponentId={frontComponentId}
        applicationId={applicationId}
        applicationName={resolvedApplicationName}
        applicationGrantedIframeMediaPermissions={
          frontComponent.applicationGrantedIframeMediaPermissions ?? []
        }
      >
        <SharedFrontComponentRenderer
          colorScheme={colorScheme}
          componentUrl={componentUrl}
          applicationAccessToken={applicationAccessToken}
          apiUrl={REACT_APP_SERVER_BASE_URL}
          functionsBaseUrl={
            frontComponent.applicationFunctionsBaseUrl ?? functionsBaseUrl
          }
          sdkClientUrls={sdkClientUrls}
          sharedDependenciesUrl={sharedDependenciesUrl}
          usesSdkClient={usesSdkClient}
          usesSharedDependencies={usesSharedDependencies}
          preloadedSources={preloadedSources}
          executionContext={executionContext}
          frontComponentHostCommunicationApi={
            frontComponentHostCommunicationApi
          }
          mediaSessionHost={mediaSessionHost}
          applicationVariables={initialApplicationVariables}
          storageNamespace={storageNamespace}
          onError={handleError}
          loadingFallback={loadingFallback}
          errorFallback={errorFallback}
          shouldPreventPageZoom={shouldPreventPageZoom}
        />
      </FrontComponentRendererProvider>
    </>
  );
};
