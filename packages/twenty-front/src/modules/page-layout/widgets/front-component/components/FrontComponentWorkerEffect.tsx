import { ThreadWebWorker } from '@quilted/threads';
import { type RemoteConnection } from '@remote-dom/core/elements';
import { type RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentWorkerApi = {
  render: (connection: RemoteConnection, sourceCode: string) => Promise<void>;
};

type FrontComponentWorkerEffectProps = {
  sourceCode: string;
  receiver: RemoteReceiver;
  onError: () => void;
};

export const FrontComponentWorkerEffect = ({
  sourceCode,
  receiver,
  onError,
}: FrontComponentWorkerEffectProps) => {
  useEffect(() => {
    let worker: Worker | null = null;

    const runWorker = async () => {
      try {
        worker = new Worker(
          new URL('./front-component.worker.ts', import.meta.url),
          { type: 'module' },
        );

        const workerSandbox = new ThreadWebWorker<FrontComponentWorkerApi>(
          worker,
        );

        await workerSandbox.imports.render(receiver.connection, sourceCode);
      } catch {
        onError();
      }
    };

    runWorker();

    return () => {
      if (isDefined(worker)) {
        worker.terminate();
      }
    };
  }, [sourceCode, receiver, onError]);

  return null;
};
