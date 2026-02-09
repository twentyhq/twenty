import { ThreadWebWorker, release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useRef } from 'react';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '../../types/WorkerExports';
import { createRemoteWorker } from '../worker/createRemoteWorker';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  authToken: string;
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
  authToken,
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
      setError(event.error);
    };

    // Expose host functions to the worker via stable refs to avoid recreating threads
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
      .render(newReceiver.connection, { componentUrl, authToken })
      .catch((error: Error) => {
        setError(error);
      });

    setReceiver(newReceiver);

    return () => {
      setThread(null);
      worker.terminate();
    };
  }, [componentUrl, authToken, setError, setReceiver, setThread]);

  return null;
};
