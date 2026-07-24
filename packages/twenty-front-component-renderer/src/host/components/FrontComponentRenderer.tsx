import { FrontComponentGeometryTrackerContext } from '@/host/contexts/FrontComponentGeometryTrackerContext';
import { createGeometryTracker } from '@/host/utils/createGeometryTracker';
import { FrontComponentErrorEffect } from '@/remote/components/FrontComponentErrorEffect';
import { FrontComponentThreadEffects } from '@/remote/components/FrontComponentThreadEffects';
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
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';
import { createFallbackComponentRegistry } from '../utils/createFallbackComponentRegistry';
import { FrontComponentErrorBox } from './FrontComponentErrorBox';

const fallbackComponentRegistry =
  createFallbackComponentRegistry(componentRegistry);

const ROOT_CONTAINER_STYLE = { width: '100%', height: '100%' };

type FrontComponentRendererProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
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
          <FrontComponentThreadEffects
            thread={thread}
            geometryTracker={geometryTracker}
            executionContext={executionContext}
            frontComponentHostCommunicationApi={
              frontComponentHostCommunicationApi
            }
            onExecutionContextInitialized={() =>
              setIsExecutionContextInitialized(true)
            }
            onError={setError}
          />
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
