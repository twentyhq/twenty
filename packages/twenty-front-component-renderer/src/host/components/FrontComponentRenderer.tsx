import { ROOT_CONTAINER_STYLE } from '@/host/constants/RootContainerStyle';
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';
import { FrontComponentConfirmationModalResultEffect } from '@/host/effect-components/FrontComponentConfirmationModalResultEffect';
import { FrontComponentErrorEffect } from '@/host/effect-components/FrontComponentErrorEffect';
import { FrontComponentGeometryTrackerEffect } from '@/host/effect-components/FrontComponentGeometryTrackerEffect';
import { FrontComponentInitializeHostCommunicationApiEffect } from '@/host/effect-components/FrontComponentInitializeHostCommunicationApiEffect';
import { FrontComponentMediaSessionEffect } from '@/host/effect-components/FrontComponentMediaSessionEffect';
import { FrontComponentUpdateContextEffect } from '@/host/effect-components/FrontComponentUpdateContextEffect';
import { FrontComponentUpdateHostCommunicationApiEffect } from '@/host/effect-components/FrontComponentUpdateHostCommunicationApiEffect';
import { type FrontComponentMediaSessionHost } from '@/host/media/types/FrontComponentMediaSessionHost';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { type ReactNode, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { isDefined } from 'twenty-shared/utils';

import { ThemeProvider } from 'twenty-ui/theme-constants';
import { FrontComponentWorkerEffect } from '@/host/effect-components/FrontComponentWorkerEffect';
import { componentRegistry } from '@/host/generated/host-component-registry';
import { createFallbackComponentRegistry } from '@/host/utils/createFallbackComponentRegistry';
import { FrontComponentErrorBox } from '@/host/components/FrontComponentErrorBox';

const fallbackComponentRegistry =
  createFallbackComponentRegistry(componentRegistry);

type FrontComponentRendererProps = {
  componentUrl: string;
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

  const isReady = isDefined(receiver) && isExecutionContextInitialized;

  return (
    <FrontComponentGeometryTrackerContext.Provider value={geometryTracker}>
      <div ref={geometryTracker.setRoot} style={ROOT_CONTAINER_STYLE}>
        <FrontComponentWorkerEffect
          componentUrl={componentUrl}
          applicationAccessToken={applicationAccessToken}
          apiUrl={apiUrl}
          functionsBaseUrl={functionsBaseUrl}
          sdkClientUrls={sdkClientUrls}
          sharedDependenciesUrl={sharedDependenciesUrl}
          applicationVariables={applicationVariables}
          storageNamespace={storageNamespace}
          geometryTracker={geometryTracker}
          mediaSessionHost={mediaSessionHost}
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
                frontComponentHostCommunicationApi
              }
            />
            <FrontComponentInitializeHostCommunicationApiEffect
              thread={thread}
            />
            <FrontComponentGeometryTrackerEffect
              thread={thread}
              geometryTracker={geometryTracker}
            />
            {isDefined(mediaSessionHost) && (
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
              <RemoteRootRenderer
                receiver={receiver}
                components={fallbackComponentRegistry}
              />
            </ErrorBoundary>
          </ThemeProvider>
        )}
      </div>
    </FrontComponentGeometryTrackerContext.Provider>
  );
};
