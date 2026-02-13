import { type FrontComponentHostCommunicationApi } from '@/front-component-renderer/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/front-component-renderer/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentHostCommunicationApiEffectProps = {
  thread: ThreadWebWorker<WorkerExports, FrontComponentHostCommunicationApi>;
};

export const FrontComponentHostCommunicationApiEffect = ({
  thread,
}: FrontComponentHostCommunicationApiEffectProps) => {
  useEffect(() => {
    thread.imports.initializeHostCommunicationApi().catch((error) => {
      console.error('Failed to initialize host communication API:', error);
    });
  }, [thread]);

  return null;
};
