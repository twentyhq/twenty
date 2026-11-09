import { useMutation } from '@apollo/client/react';

import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
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

  const sendAppChannelMessage = async ({
    messageChannelId,
    messageThreadId,
    text,
    idempotencyKey,
  }: {
    messageChannelId: string;
    messageThreadId: string;
    text: string;
    idempotencyKey: string;
  }) => {
    await sendAppChannelMessageMutation({
      variables: {
        input: { messageChannelId, messageThreadId, text, idempotencyKey },
      },
    });

    await apolloCoreClient
      .refetchQueries({ include: [getTimelineThreadsFromObjectRecord] })
      .catch(() => undefined);
  };

  return { sendAppChannelMessage };
};
