import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

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
      idempotencyKey,
    }: {
      messageChannelId: string;
      messageThreadId: string;
      text: string;
      idempotencyKey: string;
    }) => {
      await sendAppChannelMessageMutation({
        variables: {
          input: {
            messageChannelId,
            messageThreadId,
            text,
            idempotencyKey,
          },
        },
      });
    },
    [sendAppChannelMessageMutation],
  );

  return { sendAppChannelMessage };
};
