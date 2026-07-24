import { FrontComponentExternalNavigationContext } from '@/host/contexts/FrontComponentExternalNavigationContext';
import { type RequestExternalNavigation } from '@/host/types/RequestExternalNavigation';
import { FrontComponentConfirmationModalResultEffect } from '@/remote/components/FrontComponentConfirmationModalResultEffect';
import { FrontComponentErrorEffect } from '@/remote/components/FrontComponentErrorEffect';
import { FrontComponentInitializeHostCommunicationApiEffect } from '@/remote/components/FrontComponentInitializeHostCommunicationApiEffect';
import { FrontComponentUpdateContextEffect } from '@/remote/components/FrontComponentUpdateContextEffect';
import { FrontComponentUpdateHostCommunicationApiEffect } from '@/remote/components/FrontComponentUpdateHostCommunicationApiEffect';
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

type FrontComponentRendererProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  onRequestExternalNavigation?: RequestExternalNavigation;
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
  onRequestExternalNavigation,
  onError,
  colorScheme,
  loadingFallback,
}: FrontComponentRendererProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);
  const [thread, setThread] = useState<FrontComponentThread | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isExecutionContextInitialized, setIsExecutionContextInitialized] =
    useState(false);

  const isReady = isDefined(receiver) && isExecutionContextInitialized;

  return (
    <>
      <FrontComponentWorkerEffect
        componentUrl={componentUrl}
        applicationAccessToken={applicationAccessToken}
        apiUrl={apiUrl}
        functionsBaseUrl={functionsBaseUrl}
        sdkClientUrls={sdkClientUrls}
        applicationVariables={applicationVariables}
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
          <FrontComponentInitializeHostCommunicationApiEffect thread={thread} />
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
            <FrontComponentExternalNavigationContext.Provider
              value={onRequestExternalNavigation ?? null}
            >
              <RemoteRootRenderer
                receiver={receiver}
                components={fallbackComponentRegistry}
              />
            </FrontComponentExternalNavigationContext.Provider>
          </ErrorBoundary>
        </ThemeProvider>
      )}
    </>
  );
};
