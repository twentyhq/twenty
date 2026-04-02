import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentUpdateHostCommunicationApiEffectProps = {
  thread: ThreadWebWorker<WorkerExports, FrontComponentHostCommunicationApi>;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
};

export const FrontComponentUpdateHostCommunicationApiEffect = ({
  thread,
  frontComponentHostCommunicationApi,
}: FrontComponentUpdateHostCommunicationApiEffectProps) => {
  useEffect(() => {
    Object.assign(thread.exports, frontComponentHostCommunicationApi);
  }, [thread, frontComponentHostCommunicationApi]);

  return null;
};
