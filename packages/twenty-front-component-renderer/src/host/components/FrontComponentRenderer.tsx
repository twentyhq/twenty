import { ROOT_CONTAINER_STYLE } from '@/host/constants/RootContainerStyle';
import { FrontComponentReadOnlyContext } from '@/host/contexts/FrontComponentReadOnlyContext';
import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';
import { FrontComponentRemoteRootRenderer } from '@/host/components/FrontComponentRemoteRootRenderer';
import { FrontComponentPointerCaptureControllerContext } from '@/host/events/contexts/FrontComponentPointerCaptureControllerContext';
import { createHostPointerCaptureController } from '@/host/events/utils/createHostPointerCaptureController';
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';
import { FrontComponentHostFocusControllerContext } from '@/host/focus/contexts/FrontComponentHostFocusControllerContext';
import { createHostFocusController } from '@/host/focus/utils/createHostFocusController';
import { FrontComponentConfirmationModalResultEffect } from '@/host/effect-components/FrontComponentConfirmationModalResultEffect';
import { FrontComponentErrorEffect } from '@/host/effect-components/FrontComponentErrorEffect';
import { FrontComponentFocusTrackerEffect } from '@/host/effect-components/FrontComponentFocusTrackerEffect';
import { FrontComponentGeometryTrackerEffect } from '@/host/effect-components/FrontComponentGeometryTrackerEffect';
import { FrontComponentInitializeHostCommunicationApiEffect } from '@/host/effect-components/FrontComponentInitializeHostCommunicationApiEffect';
import { FrontComponentMediaSessionEffect } from '@/host/effect-components/FrontComponentMediaSessionEffect';
import { FrontComponentPointerCaptureEffect } from '@/host/effect-components/FrontComponentPointerCaptureEffect';
import { FrontComponentUpdateContextEffect } from '@/host/effect-components/FrontComponentUpdateContextEffect';
import { FrontComponentUpdateHostCommunicationApiEffect } from '@/host/effect-components/FrontComponentUpdateHostCommunicationApiEffect';
import { type FrontComponentMediaSessionHost } from '@/host/media/types/FrontComponentMediaSessionHost';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { type RemoteReceiver } from '@remote-dom/react/host';
import { type ReactNode, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { isDefined } from 'twenty-shared/utils';

import { ThemeProvider } from 'twenty-ui/theme';
import { FrontComponentWorkerEffect } from '@/host/effect-components/FrontComponentWorkerEffect';
import { componentRegistry } from '@/host/generated/host-component-registry';
import { createFallbackComponentRegistry } from '@/host/utils/createFallbackComponentRegistry';
import { FrontComponentErrorBox } from '@/host/components/FrontComponentErrorBox';

const fallbackComponentRegistry =
  createFallbackComponentRegistry(componentRegistry);
const readOnlyComponentRegistry = createFallbackComponentRegistry(
  componentRegistry,
  true,
);

type FrontComponentRendererProps = {
  componentUrl: string;
  componentSource?: string;
  sharedDependenciesSource?: string;
  readOnlyData?: Record<string, unknown>;
  onReady?: () => void;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  sharedDependenciesUrl?: string;
  applicationVariables?: Record<string, string>;
  storageNamespace?: string;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  mediaSessionHost?: FrontComponentMediaSessionHost;
  onError: (error?: Error) => void;
  colorScheme: 'light' | 'dark';
  loadingFallback?: ReactNode;
};

export const FrontComponentRenderer = ({
  componentUrl,
  componentSource,
  sharedDependenciesSource,
  readOnlyData,
  onReady,
  applicationAccessToken,
  apiUrl,
  functionsBaseUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
  applicationVariables,
  storageNamespace,
  executionContext,
  frontComponentHostCommunicationApi,
  mediaSessionHost,
  onError,
  colorScheme,
  loadingFallback,
}: FrontComponentRendererProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);
  const [thread, setThread] = useState<FrontComponentThread | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isExecutionContextInitialized, setIsExecutionContextInitialized] =
    useState(false);
  const [geometryTracker] = useState(() => createGeometryTracker());
  const [hostFocusController] = useState(() =>
    createHostFocusController({ geometryTracker }),
  );
  const [pointerCaptureController] = useState(() =>
    createHostPointerCaptureController({ geometryTracker }),
  );
  const [initialExecutionContext] = useState(executionContext);

  const isReady = isDefined(receiver) && isExecutionContextInitialized;
  const isReadOnly = isDefined(readOnlyData);

  return (
    <FrontComponentReadOnlyContext.Provider value={isReadOnly}>
      <FrontComponentGeometryTrackerContext.Provider value={geometryTracker}>
        <div
          ref={geometryTracker.setRoot}
          style={{
            ...ROOT_CONTAINER_STYLE,
            ...(isReadOnly && {
              contain: 'layout paint style',
              isolation: 'isolate',
              overflow: 'auto',
            }),
          }}
        >
          <FrontComponentWorkerEffect
            componentUrl={componentUrl}
            componentSource={componentSource}
            sharedDependenciesSource={sharedDependenciesSource}
            readOnlyData={readOnlyData}
            onReady={onReady}
            applicationAccessToken={
              isReadOnly ? undefined : applicationAccessToken
            }
            apiUrl={isReadOnly ? undefined : apiUrl}
            functionsBaseUrl={isReadOnly ? undefined : functionsBaseUrl}
            sdkClientUrls={isReadOnly ? undefined : sdkClientUrls}
            sharedDependenciesUrl={
              isReadOnly ? undefined : sharedDependenciesUrl
            }
            applicationVariables={isReadOnly ? undefined : applicationVariables}
            storageNamespace={isReadOnly ? undefined : storageNamespace}
            initialExecutionContext={initialExecutionContext}
            geometryTracker={geometryTracker}
            hostFocusController={hostFocusController}
            mediaSessionHost={isReadOnly ? undefined : mediaSessionHost}
            setReceiver={setReceiver}
            setThread={setThread}
            setError={setError}
          />

          {isDefined(error) && (
            <ThemeProvider colorScheme={colorScheme}>
              <FrontComponentErrorEffect error={error} onError={onError} />
              <FrontComponentErrorBox error={error} />
            </ThemeProvider>
          )}

          {isDefined(thread) && (
            <>
              <FrontComponentUpdateHostCommunicationApiEffect
                thread={thread}
                frontComponentHostCommunicationApi={
                  isReadOnly
                    ? FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP
                    : frontComponentHostCommunicationApi
                }
              />
              <FrontComponentInitializeHostCommunicationApiEffect
                thread={thread}
              />
              <FrontComponentGeometryTrackerEffect
                thread={thread}
                geometryTracker={geometryTracker}
              />
              <FrontComponentFocusTrackerEffect
                thread={thread}
                geometryTracker={geometryTracker}
              />
              <FrontComponentPointerCaptureEffect
                thread={thread}
                pointerCaptureController={pointerCaptureController}
              />
              {!isReadOnly && isDefined(mediaSessionHost) && (
                <FrontComponentMediaSessionEffect
                  thread={thread}
                  mediaSessionHost={mediaSessionHost}
                />
              )}
              <FrontComponentUpdateContextEffect
                thread={thread}
                executionContext={executionContext}
                onExecutionContextInitialized={() =>
                  setIsExecutionContextInitialized(true)
                }
              />
              <FrontComponentConfirmationModalResultEffect
                thread={thread}
                frontComponentId={executionContext.frontComponentId}
                onError={setError}
              />
            </>
          )}

          {!isDefined(error) && !isReady && loadingFallback}

          {isReady && (
            <ThemeProvider colorScheme={colorScheme}>
              <ErrorBoundary
                onError={setError}
                onReset={() => setError(null)}
                resetKeys={[componentUrl]}
                fallbackRender={() => null}
              >
                <FrontComponentHostFocusControllerContext.Provider
                  value={hostFocusController}
                >
                  <FrontComponentPointerCaptureControllerContext.Provider
                    value={pointerCaptureController}
                  >
                    <FrontComponentRemoteRootRenderer
                      receiver={receiver}
                      components={
                        isReadOnly
                          ? readOnlyComponentRegistry
                          : fallbackComponentRegistry
                      }
                    />
                  </FrontComponentPointerCaptureControllerContext.Provider>
                </FrontComponentHostFocusControllerContext.Provider>
              </ErrorBoundary>
            </ThemeProvider>
          )}
        </div>
      </FrontComponentGeometryTrackerContext.Provider>
    </FrontComponentReadOnlyContext.Provider>
  );
};
