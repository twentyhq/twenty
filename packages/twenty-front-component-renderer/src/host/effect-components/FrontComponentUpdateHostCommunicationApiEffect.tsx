import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';
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
    Object.assign(thread.exports, frontComponentHostCommunicationApi, {
      getUserApplicationVariables:
        frontComponentHostCommunicationApi.getUserApplicationVariables ??
        FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP.getUserApplicationVariables,
      updateUserApplicationVariable:
        frontComponentHostCommunicationApi.updateUserApplicationVariable ??
        FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP.updateUserApplicationVariable,
    });
  }, [thread, frontComponentHostCommunicationApi]);

  return null;
};
