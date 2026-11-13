import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { EmojiPicker, LightIconButton } from 'twenty-ui/components/input';
import { IconMoodPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { INBOX_EMOJIBASE_URL } from '@/ai/constants/InboxEmojibaseUrl';
import { INBOX_QUICK_REACTION_EMOJIS } from '@/ai/constants/InboxQuickReactionEmojis';

const StyledQuickReactions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledEmoji = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
`;

const StyledDivider = styled.div`
  background: ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  width: 1px;
`;

type InboxMessageReactionPickerContentProps = {
  isEmojiPickerOpen: boolean;
  onEmojiSelect: (emoji: string) => void;
  onShowMore: () => void;
};

export const InboxMessageReactionPickerContent = ({
  isEmojiPickerOpen,
  onEmojiSelect,
  onShowMore,
}: InboxMessageReactionPickerContentProps) => {
  const { t } = useLingui();

  if (isEmojiPickerOpen) {
    return (
      <EmojiPicker
        emojibaseUrl={INBOX_EMOJIBASE_URL}
        searchLabel={t`Search emojis`}
        loadingLabel={t`Loading emojis`}
        emptyLabel={t`No emoji found`}
        autoFocus
        onEmojiSelect={onEmojiSelect}
      />
    );
  }

  return (
    <StyledQuickReactions>
      {INBOX_QUICK_REACTION_EMOJIS.map((emoji) => (
        <LightIconButton
          key={emoji}
          size="md"
          aria-label={emoji}
          onClick={() => onEmojiSelect(emoji)}
        >
          <StyledEmoji aria-hidden>{emoji}</StyledEmoji>
        </LightIconButton>
      ))}
      <StyledDivider />
      <LightIconButton
        size="md"
        aria-label={t`More reactions`}
        tooltip={t`More reactions`}
        onClick={onShowMore}
      >
        <IconMoodPlus />
      </LightIconButton>
    </StyledQuickReactions>
  );
};
