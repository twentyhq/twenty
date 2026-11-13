import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconMoodSmile } from 'twenty-ui/icon';

import { InboxMessageReactionPickerContent } from '@/ai/components/InboxMessageReactionPickerContent';
import { useToggleInboxMessageReaction } from '@/ai/hooks/useToggleInboxMessageReaction';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const INBOX_MESSAGE_REACTION_PICKER_WIDTH_PX = 296;
const INBOX_QUICK_REACTIONS_WIDTH_PX = 249;

type InboxMessageReactionPickerProps = {
  messageId: string;
};

export const InboxMessageReactionPicker = ({
  messageId,
}: InboxMessageReactionPickerProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const dropdownId = `ai-chat-message-reaction-picker-${instanceId}`;
  const { closeDropdown } = useCloseDropdown();
  const { toggleInboxMessageReaction } = useToggleInboxMessageReaction();

  const react = (emoji: string) => {
    closeDropdown(dropdownId);
    void toggleInboxMessageReaction({ messageId, emoji });
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
            ? INBOX_MESSAGE_REACTION_PICKER_WIDTH_PX
            : INBOX_QUICK_REACTIONS_WIDTH_PX
        }
        side="bottom"
        align="start"
        sideOffset={4}
        aria-label={t`Add reaction`}
      >
        <InboxMessageReactionPickerContent
          isEmojiPickerOpen={isEmojiPickerOpen}
          onEmojiSelect={react}
          onShowMore={() => setIsEmojiPickerOpen(true)}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
