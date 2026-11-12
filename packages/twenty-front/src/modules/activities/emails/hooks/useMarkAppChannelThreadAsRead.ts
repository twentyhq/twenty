import { useMutation } from '@apollo/client/react';

import { MARK_APP_CHANNEL_THREAD_AS_READ } from '@/activities/emails/graphql/mutations/markAppChannelThreadAsRead';
import {
  type MarkAppChannelThreadAsReadMutation,
  type MarkAppChannelThreadAsReadMutationVariables,
} from '~/generated-metadata/graphql';

export const useMarkAppChannelThreadAsRead = () => {
  const [markAppChannelThreadAsReadMutation] = useMutation<
    MarkAppChannelThreadAsReadMutation,
    MarkAppChannelThreadAsReadMutationVariables
  >(MARK_APP_CHANNEL_THREAD_AS_READ);

  // Best effort: the conversation stays readable in Twenty whatever the provider answers.
  const markAppChannelThreadAsRead = ({
    messageChannelId,
    messageThreadId,
  }: {
    messageChannelId: string;
    messageThreadId: string;
  }) => {
    markAppChannelThreadAsReadMutation({
      variables: { input: { messageChannelId, messageThreadId } },
    }).catch(() => undefined);
  };

  return { markAppChannelThreadAsRead };
};
