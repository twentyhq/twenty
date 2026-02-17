import { type FrontComponentHostCommunicationApi } from '@/front-component-renderer/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/front-component-renderer/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import { type RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentRenderEffectProps = {
  thread: ThreadWebWorker<WorkerExports, FrontComponentHostCommunicationApi>;
  receiver: RemoteReceiver;
  componentUrl: string;
  apiUrl?: string;
  applicationAccessToken?: string;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};

export const FrontComponentRenderEffect = ({
  thread,
  receiver,
  componentUrl,
  apiUrl,
  applicationAccessToken,
  setError,
}: FrontComponentRenderEffectProps) => {
  const [renderedThread, setRenderedThread] = useState<ThreadWebWorker<
    WorkerExports,
    FrontComponentHostCommunicationApi
  > | null>(null);

  useEffect(() => {
    if (renderedThread === thread) {
      return;
    }

    setRenderedThread(thread);

    let isEffectCancelled = false;

    const startRender = async () => {
      try {
        if (isDefined(applicationAccessToken)) {
          await thread.imports.updateAccessToken(applicationAccessToken);
        }

        await thread.imports.render(receiver.connection, {
          componentUrl,
          apiUrl,
        });
      } catch (error) {
        if (isEffectCancelled) {
          return;
        }

        setError(error as Error);
      }
    };

    void startRender();

    return () => {
      isEffectCancelled = true;
    };
  }, [
    apiUrl,
    applicationAccessToken,
    componentUrl,
    receiver,
    renderedThread,
    setError,
    thread,
  ]);

  return null;
};
