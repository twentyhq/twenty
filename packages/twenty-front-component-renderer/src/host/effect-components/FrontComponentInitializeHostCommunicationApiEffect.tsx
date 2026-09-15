import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { useEffect } from 'react';

type FrontComponentInitializeHostCommunicationApiEffectProps = {
  thread: FrontComponentThread;
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
