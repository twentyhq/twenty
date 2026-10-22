import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { EmojiPicker } from 'frimousse';
import { themeCssVariables } from 'twenty-ui/theme';

import { AGENT_CHAT_EMOJIBASE_URL } from '@/ai/constants/AgentChatEmojibaseUrl';

const AI_CHAT_EMOJI_PICKER_HEIGHT_PX = 280;

const StyledEmojiPicker = styled.div`
  [frimousse-root] {
    display: flex;
    flex-direction: column;
    height: ${AI_CHAT_EMOJI_PICKER_HEIGHT_PX}px;
  }

  [frimousse-search] {
    background: ${themeCssVariables.background.transparent.lighter};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: ${themeCssVariables.border.radius.sm};
    color: ${themeCssVariables.font.color.primary};
    font-family: inherit;
    font-size: ${themeCssVariables.font.size.md};
    margin: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  }

  [frimousse-viewport] {
    flex: 1;
    outline: none;
  }

  [frimousse-category-header] {
    background: ${themeCssVariables.background.primary};
    color: ${themeCssVariables.font.color.tertiary};
    font-size: ${themeCssVariables.font.size.xs};
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  }

  [frimousse-row] {
    padding: 0 ${themeCssVariables.spacing[1]};
  }

  [frimousse-emoji] {
    background: none;
    border: none;
    border-radius: ${themeCssVariables.border.radius.sm};
    cursor: pointer;
    font-size: ${themeCssVariables.font.size.lg};
    height: ${themeCssVariables.spacing[8]};
    width: ${themeCssVariables.spacing[8]};

    &[data-active] {
      background: ${themeCssVariables.background.transparent.light};
    }
  }
`;

const StyledPickerMessage = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

type AiChatMessageEmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void;
};

export const AiChatMessageEmojiPicker = ({
  onEmojiSelect,
}: AiChatMessageEmojiPickerProps) => {
  const { t } = useLingui();

  return (
    <StyledEmojiPicker>
      <EmojiPicker.Root
        emojibaseUrl={AGENT_CHAT_EMOJIBASE_URL}
        columns={8}
        onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}
      >
        <EmojiPicker.Search
          aria-label={t`Search emojis`}
          placeholder={t`Search emojis`}
          autoFocus
        />
        <EmojiPicker.Viewport>
          <EmojiPicker.Loading>
            <StyledPickerMessage>{t`Loading emojis`}</StyledPickerMessage>
          </EmojiPicker.Loading>
          <EmojiPicker.Empty>
            <StyledPickerMessage>{t`No emoji found`}</StyledPickerMessage>
          </EmojiPicker.Empty>
          <EmojiPicker.List />
        </EmojiPicker.Viewport>
      </EmojiPicker.Root>
    </StyledEmojiPicker>
  );
};
