import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconClockHour8, IconClockPlay } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { AGENT_CHAT_THREAD_SNOOZE_PRESETS } from '@/ai/constants/AgentChatThreadSnoozePresets';
import { useAiChatThreadById } from '@/ai/hooks/useAiChatThreadById';
import { getAgentChatThreadInboxState } from '@/ai/utils/getAgentChatThreadInboxState';
import { getAgentChatThreadSnoozeDate } from '@/ai/utils/getAgentChatThreadSnoozeDate';
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
  const { snoozeChatThread, reopenChatThread } = useChatThreadInboxActions();
  const { closeDropdown } = useCloseDropdown();
  const dropdownId = getAiChatThreadSnoozeDropdownId(threadId);
  const thread = useAiChatThreadById(threadId);
  const isSnoozed =
    isDefined(thread) &&
    getAgentChatThreadInboxState(thread) ===
      AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <IconButton
          size="sm"
          variant="outline"
          aria-label={isSnoozed ? t`Snoozed` : t`Snooze chat`}
        >
          <IconClockHour8 />
        </IconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {/* A snoozed chat is put away until a date nobody remembers, so
                the way back has to be the first thing in the menu that put it
                there. */}
            {isSnoozed && (
              <MenuItem
                LeftIcon={IconClockPlay}
                text={t`Unsnooze`}
                onClick={() => {
                  void reopenChatThread(threadId);
                  closeDropdown(dropdownId);
                }}
              />
            )}
            {AGENT_CHAT_THREAD_SNOOZE_PRESETS.map((preset) => (
              <MenuItem
                key={preset.key}
                text={t(preset.label)}
                onClick={() => {
                  void snoozeChatThread(
                    threadId,
                    getAgentChatThreadSnoozeDate(preset.key),
                  );
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
