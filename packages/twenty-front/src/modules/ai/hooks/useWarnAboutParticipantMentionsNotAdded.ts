import { t } from '@lingui/core/macro';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { getAgentChatRequestedParticipants } from '@/ai/utils/getAgentChatRequestedParticipants';

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
      const initialRecipientsNotAdded = initialRecipients.filter(
        ({ workspaceMemberId }) =>
          !addedWorkspaceMemberIds.includes(workspaceMemberId),
      );
      let verifiedInitialRecipientsNotAdded: AgentChatParticipantMention[] = [];

      if (isNonEmptyArray(initialRecipientsNotAdded)) {
        const page = await fetchAgentChatThreadsPage({
          lastCursor: null,
          threadIdFilter: { id: { eq: threadId } },
        }).catch(() => undefined);
        const thread = page?.threads.find(({ id }) => id === threadId);

        if (
          isDefined(thread) &&
          !isUndefined(thread.writerWorkspaceMemberIds)
        ) {
          verifiedInitialRecipientsNotAdded = initialRecipientsNotAdded.filter(
            ({ workspaceMemberId }) =>
              !thread.writerWorkspaceMemberIds?.includes(workspaceMemberId),
          );
        }
      }

      const notAddedLabels = getAgentChatRequestedParticipants({
        participantMentions: participantMentions.filter(
          ({ workspaceMemberId }) =>
            !addedWorkspaceMemberIds.includes(workspaceMemberId),
        ),
        initialRecipients: verifiedInitialRecipientsNotAdded,
      })
        .map(({ label }) => label)
        .join(', ');

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
