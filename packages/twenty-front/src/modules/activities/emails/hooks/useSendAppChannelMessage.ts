import { TIMELINE_THREADS_REFETCH_QUERIES } from '@/activities/emails/constants/TimelineThreadsRefetchQueries';
import { useMutation } from '@apollo/client/react';

import { SEND_APP_CHANNEL_MESSAGE } from '@/activities/emails/graphql/mutations/sendAppChannelMessage';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type SendAppChannelMessageMutation,
  type SendAppChannelMessageMutationVariables,
} from '~/generated-metadata/graphql';

export const useSendAppChannelMessage = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [sendAppChannelMessageMutation] = useMutation<
    SendAppChannelMessageMutation,
    SendAppChannelMessageMutationVariables
  >(SEND_APP_CHANNEL_MESSAGE);

  const sendAppChannelMessage = async (
    input: SendAppChannelMessageMutationVariables['input'],
  ) => {
    const result = await sendAppChannelMessageMutation({
      variables: { input },
    });

    await apolloCoreClient
      .refetchQueries({ include: TIMELINE_THREADS_REFETCH_QUERIES })
      .catch(() => undefined);

    return result.data?.sendAppChannelMessage ?? null;
  };

  return { sendAppChannelMessage };
};
