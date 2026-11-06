import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { groupMessageReactionsByEmoji } from '@/activities/emails/utils/groupMessageReactionsByEmoji';

const StyledReactions = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledReaction = styled.li`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type ChatThreadMessageReactionsProps = {
  message: Pick<
    EmailThreadMessageWithSender,
    'reactions' | 'messageParticipants'
  >;
};

export const ChatThreadMessageReactions = ({
  message,
}: ChatThreadMessageReactionsProps) => {
  const { t } = useLingui();

  const reactionGroups = groupMessageReactionsByEmoji({
    reactions: message.reactions ?? [],
    displayNameByHandle: new Map(
      message.messageParticipants.map((participant) => [
        participant.handle,
        getDisplayNameFromParticipant({ participant, shouldUseFullName: true }),
      ]),
    ),
  });

  if (!isNonEmptyArray(reactionGroups)) {
    return null;
  }

  return (
    <StyledReactions aria-label={t`Reactions`}>
      {reactionGroups.map(({ emoji, reactorNames }) => {
        const reactorNameList = reactorNames.join(', ');

        return (
          <StyledReaction
            key={emoji}
            title={reactorNameList}
            aria-label={t`${emoji} by ${reactorNameList}`}
          >
            <span aria-hidden>{emoji}</span>
            {reactorNames.length > 1 && (
              <span aria-hidden>{reactorNames.length}</span>
            )}
          </StyledReaction>
        );
      })}
    </StyledReactions>
  );
};
