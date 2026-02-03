import { type FrontComponentExecutionContext } from '@/front-component/types/FrontComponentExecutionContext';
import { ThreadWebWorker, release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';
import { type WorkerExports } from '../../types/WorkerExports';
import { createRemoteWorker } from '../worker/createRemoteWorker';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  executionContext: FrontComponentExecutionContext;
  setReceiver: React.Dispatch<React.SetStateAction<RemoteReceiver | null>>;
  onError: (error?: Error) => void;
};

export const FrontComponentWorkerEffect = ({
  componentUrl,
  executionContext,
  setReceiver,
  onError,
}: FrontComponentWorkerEffectProps) => {
  useEffect(() => {
    const newReceiver = new RemoteReceiver({ retain, release });

    const worker = createRemoteWorker();

    worker.onerror = (event: ErrorEvent) => {
      onError(event.error);
    };

    const thread = new ThreadWebWorker<WorkerExports>(worker);

    thread.imports
      .render(newReceiver.connection, { componentUrl, executionContext })
      .catch((error: Error) => {
        onError(error);
      });

    setReceiver(newReceiver);

    return () => {
      worker.terminate();
    };
  }, [componentUrl, executionContext, onError, setReceiver]);

  return null;
};
