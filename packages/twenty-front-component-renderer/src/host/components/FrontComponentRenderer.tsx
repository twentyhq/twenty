import { ROOT_CONTAINER_STYLE } from '@/host/constants/RootContainerStyle';
import { FrontComponentGeometryTrackerContext } from '@/host/contexts/FrontComponentGeometryTrackerContext';
import { createGeometryTracker } from '@/host/utils/createGeometryTracker';
import { FrontComponentConfirmationModalResultEffect } from '@/remote/components/FrontComponentConfirmationModalResultEffect';
import { FrontComponentErrorEffect } from '@/remote/components/FrontComponentErrorEffect';
import { FrontComponentGeometryTrackerEffect } from '@/remote/components/FrontComponentGeometryTrackerEffect';
import { FrontComponentInitializeHostCommunicationApiEffect } from '@/remote/components/FrontComponentInitializeHostCommunicationApiEffect';
import { FrontComponentUpdateContextEffect } from '@/remote/components/FrontComponentUpdateContextEffect';
import { FrontComponentUpdateHostCommunicationApiEffect } from '@/remote/components/FrontComponentUpdateHostCommunicationApiEffect';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type FrontComponentStorageNamespace } from '@/types/FrontComponentStorageNamespace';
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
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';
import { createFallbackComponentRegistry } from '../utils/createFallbackComponentRegistry';
import { FrontComponentErrorBox } from './FrontComponentErrorBox';

const fallbackComponentRegistry =
  createFallbackComponentRegistry(componentRegistry);

type FrontComponentRendererProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
  storageNamespace?: FrontComponentStorageNamespace;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
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
  applicationVariables,
  storageNamespace,
  executionContext,
  frontComponentHostCommunicationApi,
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
          applicationVariables={applicationVariables}
          storageNamespace={storageNamespace}
          geometryTracker={geometryTracker}
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
