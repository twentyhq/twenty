import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatThreadFilterDropdownContent } from '@/ai/components/AiChatThreadFilterDropdownContent';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatThreadFilterDropdown = () => {
  const { t } = useLingui();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const StatusIcon =
    AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];

  return (
    <DropdownRoot
      dropdownId="ai-chat-thread-filter"
      type="menu"
      defaultPage={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT}
    >
      <Dropdown.Trigger
        render={
          <Button
            variant="ghost"
            size="sm"
            startIcon={<StatusIcon />}
            endIcon={<IconChevronDown />}
          >
            {t(
              AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[
                agentChatThreadFilterStatus
              ],
            )}
          </Button>
        }
      />
      <Dropdown.Content align="start" aria-label={t`Filter chats`}>
        <AiChatThreadFilterDropdownContent />
      </Dropdown.Content>
    </DropdownRoot>
  );
};
