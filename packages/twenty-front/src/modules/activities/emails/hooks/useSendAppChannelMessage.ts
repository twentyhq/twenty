import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { v4 } from 'uuid';

import { SEND_APP_CHANNEL_MESSAGE } from '@/activities/emails/graphql/mutations/sendAppChannelMessage';
import {
  type SendAppChannelMessageMutation,
  type SendAppChannelMessageMutationVariables,
} from '~/generated-metadata/graphql';

export const useSendAppChannelMessage = () => {
  const [sendAppChannelMessageMutation] = useMutation<
    SendAppChannelMessageMutation,
    SendAppChannelMessageMutationVariables
  >(SEND_APP_CHANNEL_MESSAGE);

  const sendAppChannelMessage = useCallback(
    async ({
      messageChannelId,
      messageThreadId,
      text,
    }: {
      messageChannelId: string;
      messageThreadId: string;
      text: string;
    }) => {
      await sendAppChannelMessageMutation({
        variables: {
          input: {
            messageChannelId,
            messageThreadId,
            text,
            idempotencyKey: v4(),
          },
        },
      });
    },
    [sendAppChannelMessageMutation],
  );

  return { sendAppChannelMessage };
};
