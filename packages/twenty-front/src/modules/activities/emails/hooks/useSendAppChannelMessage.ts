import { TIMELINE_THREADS_REFETCH_QUERIES } from '@/activities/emails/constants/TimelineThreadsRefetchQueries';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { SEND_APP_CHANNEL_MESSAGE } from '@/activities/emails/graphql/mutations/sendAppChannelMessage';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type SendAppChannelMessageMutation,
  type SendAppChannelMessageMutationVariables,
} from '~/generated-metadata/graphql';

export const useSendAppChannelMessage = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { enqueueToast } = useToast();
  const { t } = useLingui();
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

    const sentMessage = result.data?.sendAppChannelMessage ?? null;

    if (isNonEmptyArray(sentMessage?.rejectedAttachmentNames)) {
      const fileNames = sentMessage.rejectedAttachmentNames.join(', ');

      enqueueToast({
        status: 'error',
        children: t`Message sent, but these files could not be sent: ${fileNames}`,
      });
    }

    return sentMessage;
  };

  return { sendAppChannelMessage };
};
