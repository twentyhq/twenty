import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useFetchAiChatThreadsPage } from '@/ai/hooks/useFetchAiChatThreadsPage';
import { type AiChatParticipantMention } from '@/ai/types/AiChatParticipantMention';
import { getAiChatParticipantAdditionStatus } from '@/ai/utils/getAiChatParticipantAdditionStatus';
import { logError } from '~/utils/logError';

export const useWarnAboutParticipantMentionsNotAdded = () => {
  const { enqueueToast } = useToast();
  const { fetchAiChatThreadsPage } = useFetchAiChatThreadsPage();

  const warnAboutParticipantMentionsNotAdded = useCallback(
    async ({
      threadId,
      initialRecipients,
      participantMentions,
      addedWorkspaceMemberIds,
    }: {
      threadId: string;
      initialRecipients: AiChatParticipantMention[];
      participantMentions: AiChatParticipantMention[];
      addedWorkspaceMemberIds: string[];
    }) => {
      const requestedParticipants = {
        initialRecipients,
        participantMentions,
        addedWorkspaceMemberIds,
      };
      const { hasUnverifiedInitialRecipients: shouldVerifyInitialRecipients } =
        getAiChatParticipantAdditionStatus(requestedParticipants);
      const verificationPage = shouldVerifyInitialRecipients
        ? await fetchAiChatThreadsPage({
            lastCursor: null,
            threadIdFilter: { id: { eq: threadId } },
          }).catch((error) => {
            logError(error);

            return undefined;
          })
        : undefined;
      const writerWorkspaceMemberIds = verificationPage?.threads.find(
        ({ id }) => id === threadId,
      )?.writerWorkspaceMemberIds;
      const { hasUnverifiedInitialRecipients, notAddedLabels } =
        getAiChatParticipantAdditionStatus({
          ...requestedParticipants,
          writerWorkspaceMemberIds,
        });

      if (hasUnverifiedInitialRecipients) {
        enqueueToast({
          status: 'warning',
          children: t`Recipient delivery could not be verified. Check the chat participants.`,
        });
      }

      if (isNonEmptyString(notAddedLabels)) {
        enqueueToast({
          status: 'warning',
          children: t`${notAddedLabels} could not be added to this chat because they can't reply in it.`,
        });
      }
    },
    [enqueueToast, fetchAiChatThreadsPage],
  );

  return { warnAboutParticipantMentionsNotAdded };
};
