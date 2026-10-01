import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const AGENT_CHAT_THREAD_FILTER_STATUS_OPTIONS = [
  AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
  AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED,
  AGENT_CHAT_THREAD_FILTER_STATUS.ALL,
] as const;

export const AiChatThreadFilterDropdownStatusMenu = () => {
  const { t } = useLingui();
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);

  return (
    <>
      <Dropdown.Back>{t`Status`}</Dropdown.Back>
      <Dropdown.Section>
        {AGENT_CHAT_THREAD_FILTER_STATUS_OPTIONS.map((option) => (
          <Dropdown.OptionItem
            key={option}
            onSelect={() => {
              setAgentChatThreadFilterStatus(option);
            }}
            selected={agentChatThreadFilterStatus === option}
          >
            {t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[option])}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
