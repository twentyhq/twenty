import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { SEND_MESSAGE_BROADCAST } from '@/activities/emails/graphql/mutations/sendMessageBroadcast';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import {
  type SendMessageBroadcastMutation,
  type SendMessageBroadcastMutationVariables,
} from '~/generated-metadata/graphql';

type SendMessageBroadcastParams = {
  messageTopicId: string;
  segmentId?: string;
  subject: string;
  body: string;
  fromAddress: string;
};

export const useSendMessageBroadcast = () => {
  const [sendMessageBroadcastMutation, { loading }] = useMutation<
    SendMessageBroadcastMutation,
    SendMessageBroadcastMutationVariables
  >(SEND_MESSAGE_BROADCAST);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const sendMessageBroadcast = useCallback(
    async (params: SendMessageBroadcastParams): Promise<boolean> => {
      try {
        const result = await sendMessageBroadcastMutation({
          variables: { input: params },
        });

        const sent = result.data?.sendMessageBroadcast;

        if (sent) {
          enqueueSuccessSnackBar({
            message: t`Campaign sent to ${sent.sentCount} recipient(s)${
              sent.failedCount > 0 ? `, ${sent.failedCount} skipped` : ''
            }`,
          });

          return true;
        }

        enqueueErrorSnackBar({ message: t`Failed to send campaign` });

        return false;
      } catch {
        enqueueErrorSnackBar({ message: t`Failed to send campaign` });

        return false;
      }
    },
    [
      sendMessageBroadcastMutation,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
    ],
  );

  return { sendMessageBroadcast, loading };
};
