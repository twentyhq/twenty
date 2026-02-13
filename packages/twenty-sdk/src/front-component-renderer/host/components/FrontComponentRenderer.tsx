import { FrontComponentErrorEffect } from '@/front-component-renderer/remote/components/FrontComponentErrorEffect';
import { FrontComponentHostCommunicationApiEffect } from '@/front-component-renderer/remote/components/FrontComponentHostCommunicationApiEffect';
import { FrontComponentUpdateContextEffect } from '@/front-component-renderer/remote/components/FrontComponentUpdateContextEffect';
import { type FrontComponentExecutionContext } from '@/front-component-renderer/types/FrontComponentExecutionContext';
import { type FrontComponentHostCommunicationApi } from '@/front-component-renderer/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/front-component-renderer/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ThemeProvider } from '@emotion/react';
import { type ThemeType } from 'twenty-ui/theme';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';

type FrontComponentContentProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  onError: (error?: Error) => void;
  theme: ThemeType;
};

export const FrontComponentRenderer = ({
  componentUrl,
  applicationAccessToken,
  apiUrl,
  executionContext,
  frontComponentHostCommunicationApi,
  onError,
  theme,
}: FrontComponentContentProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);
  const [thread, setThread] = useState<ThreadWebWorker<
    WorkerExports,
    FrontComponentHostCommunicationApi
  > | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const MemoizedFrontComponentWorkerEffect = useMemo(() => {
    return (
      <FrontComponentWorkerEffect
        componentUrl={componentUrl}
        applicationAccessToken={applicationAccessToken}
        apiUrl={apiUrl}
        frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
        setReceiver={setReceiver}
        setThread={setThread}
        setError={setError}
      />
    );
  }, [
    componentUrl,
    frontComponentHostCommunicationApi,
    setError,
    setReceiver,
    setThread,
    applicationAccessToken,
    apiUrl,
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
          <FrontComponentHostCommunicationApiEffect thread={thread} />
          <FrontComponentUpdateContextEffect
            thread={thread}
            executionContext={executionContext}
          />
        </>
      )}

      {isDefined(receiver) && (
        <ThemeProvider theme={theme}>
          <RemoteRootRenderer
            receiver={receiver}
            components={componentRegistry}
          />
        </ThemeProvider>
      )}
    </>
  );
};
