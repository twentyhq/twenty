import { ThreadWebWorker, release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';
import { type WorkerExports } from '../../types/WorkerExports';
import { createRemoteWorker } from '../worker/createRemoteWorker';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  setReceiver: React.Dispatch<React.SetStateAction<RemoteReceiver | null>>;
  setThread: React.Dispatch<
    React.SetStateAction<ThreadWebWorker<WorkerExports> | null>
  >;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};

export const FrontComponentWorkerEffect = ({
  componentUrl,
  setReceiver,
  setThread,
  setError,
}: FrontComponentWorkerEffectProps) => {
  useEffect(() => {
    const newReceiver = new RemoteReceiver({ retain, release });

    const worker = createRemoteWorker();

    worker.onerror = (event: ErrorEvent) => {
      setError(event.error);
    };

    const thread = new ThreadWebWorker<WorkerExports>(worker);
    setThread(thread);

    thread.imports
      .render(newReceiver.connection, { componentUrl })
      .catch((error: Error) => {
        setError(error);
      });

    setReceiver(newReceiver);

    return () => {
      setThread(null);
      worker.terminate();
    };
  }, [componentUrl, setError, setReceiver, setThread]);

  return null;
};
