import { useMutation } from '@apollo/client/react';

import { START_APP_CHANNEL_CONVERSATION } from '@/activities/emails/graphql/mutations/startAppChannelConversation';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type StartAppChannelConversationMutation,
  type StartAppChannelConversationMutationVariables,
} from '~/generated-metadata/graphql';

export const useStartAppChannelConversation = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [startAppChannelConversationMutation, { loading }] = useMutation<
    StartAppChannelConversationMutation,
    StartAppChannelConversationMutationVariables
  >(START_APP_CHANNEL_CONVERSATION);

  const startAppChannelConversation = async ({
    messageChannelId,
    personId,
    text,
    idempotencyKey,
  }: {
    messageChannelId: string;
    personId: string;
    text: string;
    idempotencyKey: string;
  }): Promise<string | null> => {
    const { data } = await startAppChannelConversationMutation({
      variables: {
        input: { messageChannelId, personId, text, idempotencyKey },
      },
    });

    await apolloCoreClient
      .refetchQueries({ include: [getTimelineThreadsFromObjectRecord] })
      .catch(() => undefined);

    return data?.startAppChannelConversation.messageThreadId ?? null;
  };

  return { startAppChannelConversation, loading };
};
