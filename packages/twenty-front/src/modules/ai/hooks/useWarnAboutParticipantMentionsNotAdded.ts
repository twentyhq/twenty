import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { useLingui } from '@lingui/react/macro';

export const useWarnAboutParticipantMentionsNotAdded = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const warnAboutParticipantMentionsNotAdded = useCallback(
    ({
      participantMentions,
      addedWorkspaceMemberIds,
    }: {
      participantMentions: AgentChatParticipantMention[];
      addedWorkspaceMemberIds: string[];
    }) => {
      const notAddedLabels = participantMentions
        .filter(
          ({ workspaceMemberId }) =>
            !addedWorkspaceMemberIds.includes(workspaceMemberId),
        )
        .map(({ label }) => label)
        .join(', ');

      if (isNonEmptyString(notAddedLabels)) {
        enqueueToast({
          status: 'warning',
          children: t`${notAddedLabels} could not be added to this chat because they can't reply in it.`,
        });
      }
    },
    [enqueueToast, t],
  );

  return { warnAboutParticipantMentionsNotAdded };
};
