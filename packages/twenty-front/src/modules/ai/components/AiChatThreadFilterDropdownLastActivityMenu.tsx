import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS } from '@/ai/constants/AgentChatThreadLastActivityFilterLabels';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_OPTIONS = [
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ONE_DAY,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.THREE_DAYS,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.SEVEN_DAYS,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.THIRTY_DAYS,
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
] as const;

export const AiChatThreadFilterDropdownLastActivityMenu = () => {
  const { t } = useLingui();
  const [
    agentChatThreadLastActivityFilter,
    setAgentChatThreadLastActivityFilter,
  ] = useAtomState(agentChatThreadLastActivityFilterState);

  return (
    <>
      <Dropdown.Back>{t`Last activity`}</Dropdown.Back>
      <Dropdown.Section>
        {AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_OPTIONS.map((option) => (
          <Dropdown.OptionItem
            key={option}
            onSelect={() => {
              setAgentChatThreadLastActivityFilter(option);
            }}
            selected={agentChatThreadLastActivityFilter === option}
          >
            {t(AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS[option])}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
