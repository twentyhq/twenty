import { useLingui } from '@lingui/react/macro';
import { IconClockHour8 } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { AGENT_CHAT_THREAD_SNOOZE_PRESETS } from '@/ai/constants/AgentChatThreadSnoozePresets';
import { useChatThreadInboxActions } from '@/ai/hooks/useChatThreadInboxActions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const getAiChatThreadSnoozeDropdownId = (threadId: string) =>
  `ai-chat-thread-snooze-${threadId}`;

type AiChatThreadSnoozeDropdownProps = {
  threadId: string;
};

export const AiChatThreadSnoozeDropdown = ({
  threadId,
}: AiChatThreadSnoozeDropdownProps) => {
  const { t } = useLingui();
  const { snoozeChatThread } = useChatThreadInboxActions();
  const { closeDropdown } = useCloseDropdown();
  const dropdownId = getAiChatThreadSnoozeDropdownId(threadId);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <IconButton size="sm" variant="outline" aria-label={t`Snooze chat`}>
          <IconClockHour8 />
        </IconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {AGENT_CHAT_THREAD_SNOOZE_PRESETS.map((preset) => (
              <MenuItem
                key={preset.key}
                text={t(preset.label)}
                onClick={() => {
                  void snoozeChatThread(threadId, preset.getSnoozedUntil());
                  closeDropdown(dropdownId);
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
