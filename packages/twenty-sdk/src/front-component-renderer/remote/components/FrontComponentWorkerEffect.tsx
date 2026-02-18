import { ThreadWebWorker, release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useRef } from 'react';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '../../types/WorkerExports';
import { createRemoteWorker } from '../worker/utils/createRemoteWorker';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  setReceiver: React.Dispatch<React.SetStateAction<RemoteReceiver | null>>;
  setThread: React.Dispatch<
    React.SetStateAction<ThreadWebWorker<
      WorkerExports,
      FrontComponentHostCommunicationApi
    > | null>
  >;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};

export const FrontComponentWorkerEffect = ({
  componentUrl,
  applicationAccessToken,
  apiUrl,
  frontComponentHostCommunicationApi,
  setReceiver,
  setThread,
  setError,
}: FrontComponentWorkerEffectProps) => {
  const frontComponentHostCommunicationApiRef = useRef(
    frontComponentHostCommunicationApi,
  );
  frontComponentHostCommunicationApiRef.current =
    frontComponentHostCommunicationApi;

  useEffect(() => {
    const newReceiver = new RemoteReceiver({ retain, release });

    const worker = createRemoteWorker();

    worker.onerror = (event: ErrorEvent) => {
      const workerError =
        event.error ??
        new Error(event.message || 'Unknown worker error');

      console.error('[FrontComponentRenderer] Worker error:', workerError);
      setError(workerError);
    };

    const stableFrontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
      {
        navigate: (...args) =>
          frontComponentHostCommunicationApiRef.current.navigate(...args),
      };

    const thread = new ThreadWebWorker<
      WorkerExports,
      FrontComponentHostCommunicationApi
    >(worker, {
      exports: stableFrontComponentHostCommunicationApi,
    });
    setThread(thread);

    thread.imports
      .render(newReceiver.connection, {
        componentUrl,
        applicationAccessToken,
        apiUrl,
      })
      .catch((error: Error) => {
        setError(error);
      });

    setReceiver(newReceiver);

    return () => {
      setThread(null);
      worker.terminate();
    };
  }, [
    componentUrl,
    applicationAccessToken,
    apiUrl,
    setError,
    setReceiver,
    setThread,
  ]);

  return null;
};
