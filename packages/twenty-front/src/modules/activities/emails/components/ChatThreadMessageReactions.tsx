import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { ReactionButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type ChatMessageReaction } from '@/activities/emails/types/ChatMessageReaction';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

const StyledReactions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type ChatThreadMessageReactionsProps = {
  reactions: ChatMessageReaction[];
  onReactionToggle?: (emoji: string) => void;
};

export const ChatThreadMessageReactions = ({
  reactions,
  onReactionToggle,
}: ChatThreadMessageReactionsProps) => {
  const { t } = useLingui();

  return (
    <StyledReactions>
      {reactions.map(({ emoji, count, isOwn, reactorNames }) => {
        const reactors = formatDisplayList(reactorNames);

        return (
          <ReactionButton
            key={emoji}
            emoji={emoji}
            count={count}
            pressed={isOwn}
            title={reactors}
            aria-label={t`${emoji} by ${reactors}`}
            disabled={!isDefined(onReactionToggle)}
            onPressedChange={() => onReactionToggle?.(emoji)}
          />
        );
      })}
    </StyledReactions>
  );
};
