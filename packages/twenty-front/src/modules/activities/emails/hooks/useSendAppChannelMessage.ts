import { useMutation } from '@apollo/client/react';
import { type EmailAttachment } from 'twenty-shared/types';

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
    attachments,
    idempotencyKey,
  }: {
    messageChannelId: string;
    messageThreadId: string;
    text: string;
    attachments: EmailAttachment[];
    idempotencyKey: string;
  }) => {
    await sendAppChannelMessageMutation({
      variables: {
        input: {
          messageChannelId,
          messageThreadId,
          text,
          attachments: attachments.map(({ id, name }) => ({
            fileId: id,
            label: name,
          })),
          idempotencyKey,
        },
      },
    });

    await apolloCoreClient
      .refetchQueries({ include: [getTimelineThreadsFromObjectRecord] })
      .catch(() => undefined);
  };

  return { sendAppChannelMessage };
};
