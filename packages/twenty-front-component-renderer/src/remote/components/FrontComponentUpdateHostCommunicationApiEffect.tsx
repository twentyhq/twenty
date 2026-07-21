import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { useEffect } from 'react';

type FrontComponentUpdateHostCommunicationApiEffectProps = {
  thread: FrontComponentThread;
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
