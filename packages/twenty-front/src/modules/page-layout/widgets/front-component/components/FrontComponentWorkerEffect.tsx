import { type RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
    let blobUrl: string | null = null;

    try {
      const blob = new Blob([sourceCode], { type: 'application/javascript' });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl, { type: 'module' });

      const { port1, port2 } = new MessageChannel();

      port1.onmessage = (event) => {
        const message = event.data;

        if (message.type === 'mutate') {
          receiver.connection.mutate(message.records);
        } else if (message.type === 'call') {
          receiver.connection.call(message.id, message.method, ...message.args);
        }
      };
      port1.start();

      worker.postMessage({ type: 'connect', port: port2 }, [port2]);

      worker.onerror = () => {
        onError();
      };
    } catch {
      onError();
    }

    return () => {
      if (isDefined(worker)) {
        worker.terminate();
      }
      if (isDefined(blobUrl)) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [sourceCode, receiver, onError]);

  return null;
};
