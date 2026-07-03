import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/types/WorkerExports';
import { type ThreadMessagePort } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentInitializeHostCommunicationApiEffectProps = {
  thread: ThreadMessagePort<WorkerExports, FrontComponentHostCommunicationApi>;
};

export const FrontComponentInitializeHostCommunicationApiEffect = ({
  thread,
}: FrontComponentInitializeHostCommunicationApiEffectProps) => {
  useEffect(() => {
    thread.imports.initializeHostCommunicationApi().catch((error) => {
      console.error('Failed to initialize host communication API:', error);
    });
  }, [thread]);

  return null;
};
