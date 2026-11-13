import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useFetchInboxThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { type InboxParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { getInboxParticipantAdditionStatus } from '@/ai/utils/getAgentChatParticipantAdditionStatus';
import { logError } from '~/utils/logError';

export const useWarnAboutParticipantMentionsNotAdded = () => {
  const { enqueueToast } = useToast();
  const { fetchInboxThreadsPage } = useFetchInboxThreadsPage();

  const warnAboutParticipantMentionsNotAdded = useCallback(
    async ({
      threadId,
      initialRecipients,
      participantMentions,
      addedWorkspaceMemberIds,
    }: {
      threadId: string;
      initialRecipients: InboxParticipantMention[];
      participantMentions: InboxParticipantMention[];
      addedWorkspaceMemberIds: string[];
    }) => {
      const requestedParticipants = {
        initialRecipients,
        participantMentions,
        addedWorkspaceMemberIds,
      };
      const { hasUnverifiedInitialRecipients: shouldVerifyInitialRecipients } =
        getInboxParticipantAdditionStatus(requestedParticipants);
      const verificationPage = shouldVerifyInitialRecipients
        ? await fetchInboxThreadsPage({
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
        getInboxParticipantAdditionStatus({
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
    [enqueueToast, fetchInboxThreadsPage],
  );

  return { warnAboutParticipantMentionsNotAdded };
};
