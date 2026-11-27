import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { FrontComponentSourcesPreloadEffect } from '@/front-components/components/FrontComponentSourcesPreloadEffect';
import { useOnApplicationSdkClientChecksumsUpdated } from '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import { type FrontComponentSourcesPreload } from '@/front-components/types/FrontComponentSourcesPreload';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useQuery } from '@apollo/client/react';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';
import { type FrontComponentFieldsNeededToStartLoading } from '@/front-components/types/FrontComponentFieldsNeededToStartLoading';
import { FrontComponentRendererContent } from '@/front-components/components/FrontComponentRendererContent';
import { GetApplicationSdkClientChecksumsDocument } from '~/generated-metadata/graphql';

type FrontComponentRendererPrerequisitesLoaderProps = {
  frontComponentFieldsNeededToStartLoading: FrontComponentFieldsNeededToStartLoading;
  frontComponentFromFindOneQuery?: ResolvedFrontComponent;
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

export const FrontComponentRendererPrerequisitesLoader = ({
  frontComponentFieldsNeededToStartLoading,
  frontComponentFromFindOneQuery,
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
}: FrontComponentRendererPrerequisitesLoaderProps) => {
  const {
    id: frontComponentId,
    applicationId,
    builtComponentChecksum,
    usesSdkClient,
    frontComponentSharedDependenciesChecksum,
  } = frontComponentFieldsNeededToStartLoading;

  const [initialApplicationTokenPair, setInitialApplicationTokenPair] =
    useState<FrontComponentApplicationTokenPair | null>(null);
  const [applicationTokenPairLoadError, setApplicationTokenPairLoadError] =
    useState<Error | null>(null);
  const [sourcesPreload, setSourcesPreload] =
    useState<FrontComponentSourcesPreload | null>(null);

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
  const canStartFetchingSources =
    isDefined(initialApplicationTokenPair) && isSdkClientReady;
  const isReadyToRender =
    canStartFetchingSources && isDefined(frontComponentFromFindOneQuery);

  const doPreloadedSourcesMatchCurrentUrls =
    isDefined(sourcesPreload) &&
    sourcesPreload.componentUrl === componentUrl &&
    sourcesPreload.sdkClientUrls === sdkClientUrls &&
    sourcesPreload.sharedDependenciesUrl === sharedDependenciesUrl;

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
      {canStartFetchingSources &&
        !isReadyToRender &&
        !doPreloadedSourcesMatchCurrentUrls && (
          <FrontComponentSourcesPreloadEffect
            componentUrl={componentUrl}
            sdkClientUrls={sdkClientUrls}
            sharedDependenciesUrl={sharedDependenciesUrl}
            applicationAccessToken={
              initialApplicationTokenPair.applicationAccessToken.token
            }
            usesSdkClient={usesSdkClient}
            usesSharedDependencies={usesSharedDependencies}
            onSourcesPreloadStarted={setSourcesPreload}
          />
        )}
      {isDefined(applicationTokenPairLoadError) && unavailableFallback}
      {!isDefined(applicationTokenPairLoadError) &&
        !isReadyToRender &&
        loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererContent
          frontComponent={frontComponentFromFindOneQuery}
          applicationAccessToken={
            initialApplicationTokenPair.applicationAccessToken.token
          }
          componentUrl={componentUrl}
          sdkClientUrls={sdkClientUrls}
          sharedDependenciesUrl={sharedDependenciesUrl}
          usesSharedDependencies={usesSharedDependencies}
          preloadedSourcesPromise={
            doPreloadedSourcesMatchCurrentUrls
              ? sourcesPreload.sourcesPromise
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
