import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { FrontComponentMediaSessionRegistrationEffect } from '@/front-components/media-session/components/FrontComponentMediaSessionRegistrationEffect';
import { FrontComponentMediaPermissionModal } from '@/front-components/media-session/components/FrontComponentMediaPermissionModal';
import { useFrontComponentMediaSession } from '@/front-components/media-session/hooks/useFrontComponentMediaSession';
import { useGetLogicFunctionHttpUrl } from '@/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { t } from '@lingui/core/macro';
import { type ReactNode, useCallback, useState } from 'react';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { useThemeColorScheme } from 'twenty-ui/theme';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useFrontComponentRendererPrerequisitesOrThrow } from '@/front-components/contexts/FrontComponentRendererPrerequisitesContext';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-front-component-renderer';

type FrontComponentRendererContentProps = {
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

export const FrontComponentRendererContent = ({
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
  const {
    frontComponent,
    applicationAccessToken,
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    usesSharedDependencies,
    preloadedSourcesPromise,
  } = useFrontComponentRendererPrerequisitesOrThrow();

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
          preloadedSourcesPromise={preloadedSourcesPromise}
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
