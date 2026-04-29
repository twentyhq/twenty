import { FrontComponentErrorEffect } from '@/remote/components/FrontComponentErrorEffect';
import { FrontComponentInitializeHostCommunicationApiEffect } from '@/remote/components/FrontComponentInitializeHostCommunicationApiEffect';
import { FrontComponentUpdateContextEffect } from '@/remote/components/FrontComponentUpdateContextEffect';
import { FrontComponentUpdateHostCommunicationApiEffect } from '@/remote/components/FrontComponentUpdateHostCommunicationApiEffect';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type SdkClientUrls } from '@/types/HostToWorkerRenderContext';
import { type WorkerExports } from '@/types/WorkerExports';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { type ThreadWebWorker } from '@quilted/threads';
import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ThemeProvider } from 'twenty-ui/theme-constants';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';

type FrontComponentContentProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  onError: (error?: Error) => void;
  colorScheme: 'light' | 'dark';
};

export const FrontComponentRenderer = ({
  componentUrl,
  applicationAccessToken,
  apiUrl,
  sdkClientUrls,
  executionContext,
  frontComponentHostCommunicationApi,
  onError,
  colorScheme,
}: FrontComponentContentProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);
  const [thread, setThread] = useState<ThreadWebWorker<
    WorkerExports,
    FrontComponentHostCommunicationApi
  > | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isExecutionContextInitialized, setIsExecutionContextInitialized] =
    useState(false);

  const MemoizedFrontComponentWorkerEffect = useMemo(() => {
    return (
      <FrontComponentWorkerEffect
        componentUrl={componentUrl}
        applicationAccessToken={applicationAccessToken}
        apiUrl={apiUrl}
        sdkClientUrls={sdkClientUrls}
        frontComponentId={executionContext.frontComponentId}
        setReceiver={setReceiver}
        setThread={setThread}
        setError={setError}
      />
    );
  }, [
    componentUrl,
    setError,
    setReceiver,
    setThread,
    applicationAccessToken,
    apiUrl,
    sdkClientUrls,
    executionContext.frontComponentId,
  ]);

  return (
    <>
      {MemoizedFrontComponentWorkerEffect}

      {isDefined(error) && (
        <>
          <FrontComponentErrorEffect error={error} onError={onError} />
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#991b1b',
              fontFamily: 'monospace',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            <strong>FrontComponent error:</strong> {error.message}
          </div>
        </>
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
        </>
      )}

      {isDefined(receiver) && isExecutionContextInitialized && (
        <ThemeProvider colorScheme={colorScheme}>
          <RemoteRootRenderer
            receiver={receiver}
            components={componentRegistry}
          />
        </ThemeProvider>
      )}
    </>
  );
};
