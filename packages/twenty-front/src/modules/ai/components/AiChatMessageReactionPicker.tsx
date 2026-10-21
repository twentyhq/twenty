import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconMoodSmile } from 'twenty-ui/icon';

import { AiChatMessageReactionPickerContent } from '@/ai/components/AiChatMessageReactionPickerContent';
import { useToggleAgentChatMessageReaction } from '@/ai/hooks/useToggleAgentChatMessageReaction';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const AI_CHAT_MESSAGE_REACTION_PICKER_WIDTH_PX = 296;
const AI_CHAT_QUICK_REACTIONS_WIDTH_PX = 249;

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
        <AiChatMessageReactionPickerContent
          isEmojiPickerOpen={isEmojiPickerOpen}
          onEmojiSelect={react}
          onShowMore={() => setIsEmojiPickerOpen(true)}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
