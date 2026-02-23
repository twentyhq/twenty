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
  const applicationAccessTokenRef = useRef(applicationAccessToken);
  applicationAccessTokenRef.current = applicationAccessToken;

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
        event.error ?? new Error(event.message || 'Unknown worker error');

      setError(workerError);
    };

    const stableFrontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
      {
        navigate: (...args) =>
          frontComponentHostCommunicationApiRef.current.navigate(...args),
        requestAccessTokenRefresh: () =>
          frontComponentHostCommunicationApiRef.current.requestAccessTokenRefresh(),
        openSidePanelPage: (...args) =>
          frontComponentHostCommunicationApiRef.current.openSidePanelPage(...args),
        unmountFrontComponent: () =>
          frontComponentHostCommunicationApiRef.current.unmountFrontComponent(),
        enqueueSnackbar: (...args) =>
          frontComponentHostCommunicationApiRef.current.enqueueSnackbar(...args),
        closeSidePanel: () =>
          frontComponentHostCommunicationApiRef.current.closeSidePanel(),
      };

    const thread = new ThreadWebWorker<
      WorkerExports,
      FrontComponentHostCommunicationApi
    >(worker, {
      exports: stableFrontComponentHostCommunicationApi,
    });

    setThread(thread);
    setReceiver(newReceiver);
    let isEffectCancelled = false;

    const initializeAndRender = async () => {
      try {
        await thread.imports.initializeHostCommunicationApi();

        await thread.imports.render(newReceiver.connection, {
          componentUrl,
          applicationAccessToken: applicationAccessTokenRef.current,
          apiUrl,
        });
      } catch (error) {
        if (isEffectCancelled) {
          return;
        }

        setError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    void initializeAndRender();

    return () => {
      isEffectCancelled = true;
      setThread(null);
      setReceiver(null);
      worker.terminate();
    };
  }, [componentUrl, apiUrl, setError, setReceiver, setThread]);

  return null;
};
