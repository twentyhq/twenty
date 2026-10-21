import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { EmojiPicker } from 'frimousse';
import { useId, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconMoodPlus, IconMoodSmile } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AGENT_CHAT_EMOJIBASE_URL } from '@/ai/constants/AgentChatEmojibaseUrl';
import { AGENT_CHAT_QUICK_REACTION_EMOJIS } from '@/ai/constants/AgentChatQuickReactionEmojis';
import { useToggleAgentChatMessageReaction } from '@/ai/hooks/useToggleAgentChatMessageReaction';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const AI_CHAT_MESSAGE_REACTION_PICKER_WIDTH_PX = 296;
const AI_CHAT_QUICK_REACTIONS_WIDTH_PX = 249;

const StyledQuickReactions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
  padding: ${themeCssVariables.spacing[1]};

  button {
    flex-shrink: 0;
    font-size: ${themeCssVariables.font.size.lg};
  }
`;

const StyledDivider = styled.div`
  background: ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  width: 1px;
`;

const StyledEmojiPicker = styled.div`
  [frimousse-root] {
    display: flex;
    flex-direction: column;
    height: 280px;
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

type AiChatMessageReactionPickerProps = {
  messageId: string;
};

export const AiChatMessageReactionPicker = ({
  messageId,
}: AiChatMessageReactionPickerProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const dropdownId = `ai-chat-message-reaction-picker-${instanceId}`;
  const { closeDropdown } = useCloseDropdown();
  const { toggleAgentChatMessageReaction } =
    useToggleAgentChatMessageReaction();

  const react = (emoji: string) => {
    closeDropdown(dropdownId);
    void toggleAgentChatMessageReaction({ messageId, emoji });
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="panel"
      onOpenChange={() => setIsEmojiPickerOpen(false)}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label={t`Add reaction`}>
            <IconMoodSmile />
          </LightIconButton>
        }
      />
      <DropdownContent
        width={
          isEmojiPickerOpen
            ? AI_CHAT_MESSAGE_REACTION_PICKER_WIDTH_PX
            : AI_CHAT_QUICK_REACTIONS_WIDTH_PX
        }
        side="bottom"
        align="start"
        sideOffset={4}
        aria-label={t`Add reaction`}
      >
        {isEmojiPickerOpen ? (
          <StyledEmojiPicker>
            <EmojiPicker.Root
              emojibaseUrl={AGENT_CHAT_EMOJIBASE_URL}
              columns={8}
              onEmojiSelect={({ emoji }) => react(emoji)}
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
        ) : (
          <StyledQuickReactions>
            {AGENT_CHAT_QUICK_REACTION_EMOJIS.map((emoji) => (
              <LightIconButton
                key={emoji}
                size="md"
                aria-label={emoji}
                onClick={() => react(emoji)}
              >
                {emoji}
              </LightIconButton>
            ))}
            <StyledDivider />
            <LightIconButton
              size="md"
              aria-label={t`More reactions`}
              tooltip={t`More reactions`}
              onClick={() => setIsEmojiPickerOpen(true)}
            >
              <IconMoodPlus />
            </LightIconButton>
          </StyledQuickReactions>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
