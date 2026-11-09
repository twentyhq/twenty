import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { getAgentChatParticipantAdditionStatus } from '@/ai/utils/getAgentChatParticipantAdditionStatus';
import { logError } from '~/utils/logError';

export const useWarnAboutParticipantMentionsNotAdded = () => {
  const { enqueueToast } = useToast();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();

  const warnAboutParticipantMentionsNotAdded = useCallback(
    async ({
      threadId,
      initialRecipients,
      participantMentions,
      addedWorkspaceMemberIds,
    }: {
      threadId: string;
      initialRecipients: AgentChatParticipantMention[];
      participantMentions: AgentChatParticipantMention[];
      addedWorkspaceMemberIds: string[];
    }) => {
      const requestedParticipants = {
        initialRecipients,
        participantMentions,
        addedWorkspaceMemberIds,
      };
      const { hasUnverifiedInitialRecipients: shouldVerifyInitialRecipients } =
        getAgentChatParticipantAdditionStatus(requestedParticipants);
      const verificationPage = shouldVerifyInitialRecipients
        ? await fetchAgentChatThreadsPage({
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
        getAgentChatParticipantAdditionStatus({
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
    [enqueueToast, fetchAgentChatThreadsPage],
  );

  return { warnAboutParticipantMentionsNotAdded };
};
